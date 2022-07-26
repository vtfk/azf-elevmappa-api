const p360 = require('@vtfk/p360')
const { logger } = require('@vtfk/logger')
const { unescape } = require('querystring')

const repackDocuments = require('./repack-documents')

async function getFiles (client, escapedDocumentNumber, recno) {
  const documentNumber = unescape(escapedDocumentNumber)
  const { DocumentService } = client

  const documentQuery = {
    parameter: {
      DocumentNumber: documentNumber,
      IncludeFileData: true
    }
  }

  const GetDocumentsResult = await DocumentService.GetDocuments(documentQuery)

  if (!GetDocumentsResult || !GetDocumentsResult.Successful) {
    if (GetDocumentsResult.ErrorMessage) {
      logger('error', ['p360-RPC', 'getFiles', 'failed to query', documentNumber, GetDocumentsResult.ErrorMessage])
      throw Error(GetDocumentsResult.ErrorMessage)
    } else {
      logger('error', ['p360-RPC', 'getFiles', 'failed to query', 'unknown error'])
      throw Error('Unknown error - query failed')
    }
  }

  const documents = GetDocumentsResult.Documents && Array.isArray(GetDocumentsResult.Documents) ? GetDocumentsResult.Documents.find(doc => doc.DocumentNumber === documentNumber) : GetDocumentsResult.Documents && !Array.isArray(GetDocumentsResult.Documents) ? GetDocumentsResult.Documents : []
  const file = Array.isArray(documents.Files)
    ? documents.Files.find(file => file.Recno === parseInt(recno))
    : documents.Files

  return { file: file.Base64Data }
}

async function getDocuments (client, fnr, name, statuses, statusCodes, excludedEnterprises, disableFiles) {
  const { CaseService, DocumentService } = client

  // CaseService
  const caseQuery = {
    parameter: {
      Title: 'Elevmappe',
      ContactReferenceNumber: fnr
    }
  }

  const GetCasesResult = await CaseService.GetCases(caseQuery)

  if (!GetCasesResult || !GetCasesResult.Successful) {
    if (GetCasesResult.ErrorMessage) {
      logger('error', ['p360-RPC', 'getDocuments', 'failed to query cases', name, GetCasesResult.ErrorMessage])
      throw Error(GetCasesResult.ErrorMessage)
    } else {
      logger('error', ['p360-RPC', 'getDocuments', 'failed to query cases', 'unknown error'])
      throw Error('Unknown error - query failed')
    }
  }

  const cases = GetCasesResult.Cases && GetCasesResult.Cases.length > 0 ? GetCasesResult.Cases : {}

  logger('info', ['p360-RPC', 'getDocuments', name, 'get case where status can be one of', statuses])
  const { CaseNumber } = Array.isArray(cases)
    ? cases.find(caseItem => statuses.includes(caseItem.Status)) || {}
    : cases

  if (!CaseNumber) {
    return []
  }

  // DocumentService
  const documentQuery = {
    parameter: {
      CaseNumber
    }
  }

  const GetDocumentsResult = await DocumentService.GetDocuments(documentQuery)

  if (!GetDocumentsResult || !GetDocumentsResult.Successful) {
    if (GetDocumentsResult.ErrorMessage) {
      logger('error', ['p360-RPC', 'getDocuments', 'failed to query documents', name, GetDocumentsResult.ErrorMessage])
      throw Error(GetDocumentsResult.ErrorMessage)
    } else {
      logger('error', ['p360-RPC', 'getDocuments', 'failed to query documents', 'unknown error'])
      throw Error('Unknown error - query failed')
    }
  }

  const documents = GetDocumentsResult.Documents ? GetDocumentsResult.Documents : []

  // Show only documents that has StatusCode J, E, or F
  logger('info', ['p360-RPC', 'getDocuments', name, 'get documents where statusCode can be one of', statusCodes])
  let filterDocuments = documents.filter(item => statusCodes.includes(item.StatusCode))

  // Exclude certain douments by ResponsibleEnterprise
  if (excludedEnterprises.length > 0) {
    logger('info', ['p360-RPC', 'getDocuments', name, 'get documents not excluded by enterprises', excludedEnterprises])
    filterDocuments = filterDocuments.filter(item => !excludedEnterprises.includes(item.ResponsibleEnterprise.Recno))
  }

  const repackedDocuments = filterDocuments.map(documentItem => repackDocuments(documentItem, disableFiles))

  return { caseNumber: CaseNumber, documents: repackedDocuments }
}

module.exports = options => {
  const { disableFiles, name, statuses, statusCodes, excludedEnterprises } = options
  const client = p360(options)

  return {
    getDocuments: (fnr) => getDocuments(client, fnr, name, statuses, statusCodes, excludedEnterprises, disableFiles),
    getFiles: (documentId, recno) => getFiles(client, documentId, recno)
  }
}
