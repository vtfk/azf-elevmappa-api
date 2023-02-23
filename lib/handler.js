const { logger } = require('@vtfk/logger')
const NodeCache = require('node-cache')
const getPifuData = require('./get-pifu-data')
const auditLogger = require('../lib/log-to-audit')
const retrieveDocuments = require('../lib/retrieve-documents')
const retrieveFile = require('../lib/archive/retrieve-file')
const HTTPError = require('./http-error')

const cache = new NodeCache({ stdTTL: 15 * 60 }) // TTL: 15 minutes times 60 seconds (900 seconds)

// #region private commands
const hasGroups = groups => Array.isArray(groups) && groups.length > 0

const auditLog = async (upn, id, route, message, accessType) => {
  try {
    const result = await auditLogger(upn, id, route, message, accessType)
    logger('info', ['handler', 'audit log', route, result.insertedId ? 1 : result])
  } catch (error) {
    logger('error', ['handler', 'audit log failed', route, error])
  }
}

const getStudentDocuments = async personalIdNumber => {
  try {
    logger('info', ['handler', 'getStudentDocuments', 'lookup documents'])
    const documents = await retrieveDocuments(personalIdNumber)
    logger('info', ['handler', 'getStudentDocuments', 'got documents', documents.length])
    return documents
  } catch (error) {
    logger('error', ['handler', 'getStudentDocuments', error])
    return []
  }
}

const getSchoolStudent = async (id, students) => {
  logger('info', ['handler', 'getSchoolStudent', 'find student', students.length])

  const student = students.find(student => student.userName === id)
  if (!student) {
    logger('warn', ['handler', 'getSchoolStudent', 'no student found'])
    return false
  }

  const documents = await getStudentDocuments(student.personalIdNumber)
  student.documents = documents
  return student
}

const getTeacherStudent = async (upn, id) => {
  logger('info', ['handler', 'getTeacherStudent', 'lookup student'])

  try {
    const students = await getPifuData(upn, `students/${id}`)

    if (students.length > 0) {
      logger('info', ['handler', 'getTeacherStudent', 'got student', students.length])
      const student = students[0]
      const documents = await getStudentDocuments(student.personalIdNumber)
      student.documents = documents
      return student
    } else {
      logger('warn', ['handler', 'getTeacherStudent', 'no student found'])
      return false
    }
  } catch (error) {
    logger('error', ['handler', 'getTeacherStudent', error])
    return false
  }
}

const getSchoolStudents = async (upn, groups) => {
  try {
    logger('info', ['handler', 'getSchoolStudents', 'by group access', groups])
    const students = []
    for (const group of groups) {
      const shortName = group.split('-')[0]
      const data = await getPifuData(upn, `schools/${shortName}/students`)
      if (!data.statusKode) {
        students.push(...data)
      }
    }
    logger('info', ['handler', 'getSchoolStudents', 'by group access', 'got data', students.length])
    return students.length > 0 ? students : false
  } catch (error) {
    if (!error.response) {
      logger('error', ['handler', 'getSchoolStudents', 'no response', error])
      throw new HTTPError(500, error.message)
    } else {
      const { status, data } = error.response
      logger('error', ['handler', 'getSchoolStudents', 'by group access', status, data])
      throw new HTTPError(status, data)
    }
  }
}

const getTeacherStudents = async upn => {
  try {
    logger('info', ['handler', 'getTeacherStudents'])
    const data = await getPifuData(upn, 'students?name=*')
    logger('info', ['handler', 'getTeacherStudents', 'got data', data.length])
    return !data.statusKode ? data : false
  } catch (error) {
    if (!error.response) {
      logger('error', ['handler', 'getTeacherStudents', 'no response', error])
      throw new HTTPError(500, error.message)
    } else {
      const { status, data } = error.response
      logger('error', ['handler', 'getTeacherStudents', status, data])
      throw new HTTPError(status, data)
    }
  }
}

const verifyDocumentRelation = async (upn, id, groups, documentId, recno) => {
  // get student documents from cached student
  let student = cache.get(upn + id)
  if (!student) {
    // not found in cache - get from pifu and cache it
    student = await getStudent(upn, id, groups)
    cache.set(upn + id, student)
  }

  const hasAccess = student.accessType === 'groupAccess' || student.contactTeacher
  logger('info', ['handler', 'verifyDocumentRelation', 'checking file-access. Must be "groupAccess" or "contactTeacher"', 'accessType', student.accessType, 'contactTeacher', student.contactTeacher, 'hasAccess', hasAccess])

  const documentMatch = hasAccess && student.documents.find(doc => doc.documentNumber === documentId)
  const fileMatch = documentMatch && documentMatch.files ? documentMatch.files.find(file => file.recno === recno) : undefined
  return {
    documents: fileMatch,
    accessType: student.accessType
  }
}

const verifyStudentRelation = async (upn, id, groups) => {
  // return teacher student relation from cache
  const cachedStudents = cache.get(upn)
  if (cachedStudents) {
    logger('info', ['handler', 'verifyStudentRelation', 'from-cache'])
    return cachedStudents.find(({ userName }) => userName === id)
  }

  // return teacher student relation if not in cache
  const students = await getStudents(upn, groups)
  cache.set(upn, students)
  logger('info', ['handler', 'verifyStudentRelation'])
  return students.find(({ userName }) => userName === id)
}
// #endregion

// #region public methods
const getStudent = async (upn, id, groups) => {
  // get cached student
  const cachedStudent = cache.get(upn + id)
  if (cachedStudent) {
    logger('info', ['handler', `getStudent ${cachedStudent.accessType} data`, 'from-cache'])
    return cachedStudent
  }

  const verifiedRelation = await verifyStudentRelation(upn, id, groups)
  if (!verifiedRelation) {
    logger('error', ['handler', 'getStudent', 'ingen tilgang', 'Rådgiverrelasjon og Lærer/Elev-relasjon finnes ikke i Visma InSchool'])
    throw new HTTPError(401, `access to student ${id} is denied`)
  }

  const student = hasGroups(groups) ? await getSchoolStudent(id, cache.get(upn)) : await getTeacherStudent(upn, id)
  student.accessType = hasGroups(groups) ? 'groupAccess' : 'pifuAccess'
  cache.set(upn + id, student)
  logger('info', ['handler', `getStudent ${student.accessType} data`])

  // log to mongo that someone has requested info about this user
  await auditLog(upn, id, 'getStudent', `${upn} opened ${id}'s archive folder`, student.accessType)

  return student
}

const getStudents = async (upn, groups) => {
  const cachedStudents = cache.get(upn)
  if (cachedStudents) {
    logger('info', ['handler', 'getStudents', 'from cache', cachedStudents.length])
    return cachedStudents
  }

  const students = hasGroups(groups) ? await getSchoolStudents(upn, groups) : await getTeacherStudents(upn)
  cache.set(upn, students)
  logger('info', ['handler', 'getStudents', students.length])
  return students
}

const getFile = async (source, documentId, recno, upn, id, groups) => {
  const verifiedRelation = await verifyStudentRelation(upn, id, groups)
  if (!verifiedRelation) {
    logger('error', ['handler', 'getFile', 'verifyStudentRelation', 'ingen tilgang', 'Rådgiverrelasjon og Lærer/Elev-relasjon finnes ikke i Visma InSchool'])
    throw new HTTPError(401, `access to student ${id} is denied`)
  }

  const { documents: verifiedDocumentRelation, accessType } = await verifyDocumentRelation(upn, id, groups, documentId, recno)
  if (!verifiedDocumentRelation) {
    logger('error', ['handler', 'getFile', 'verifyDocumentRelation', 'ingen tilgang', 'Lærer er ikke kontaktlærer for eleven, eller dokument- eller filnummeret tilhører ikke denne eleven'])
    throw new HTTPError(401, `access to document ${documentId} is denied`)
  }

  // log to mongo that someone has requested to view a document about this user
  await auditLog(upn, id, 'getFile', `${upn} viewed file with ID ${documentId} and recno ${recno} from source ${source}!`, accessType)

  const file = await retrieveFile(source, documentId, recno)
  if (file && file.file) {
    logger('info', ['handler', 'getFile', `return ${accessType} data`, documentId, recno])
    return file
  } else {
    logger('warn', ['handler', 'getFile', `${accessType} data - not found`, source, documentId, recno])
    return { message: 'not found' }
  }
}
// #endregion

module.exports = {
  getFile,
  getStudent,
  getStudents
}
