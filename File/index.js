const { logger } = require('@vtfk/logger')
const HTTPError = require('../lib/http-error')
const validateTokenAuth = require('../lib/validate-token-auth')
const generateResponse = require('../lib/generate-response')
const { getFile } = require('../lib/handler')

const handleFile = async (context, req) => {
  const { source, fileId: documentId, recno, studentId: id } = req.body
  const { groups, upn } = req.token

  if (!upn) {
    logger('error', ['handleFile', 'upn missing', upn])
    return new HTTPError(400, 'upn missing').toJSON()
  }

  try {
    logger('info', ['handleFile', 'get file'])
    const file = await getFile(source, documentId, recno, upn, id, groups)
    return generateResponse(file, file.file ? 200 : 404)
  } catch (error) {
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, error.message, error).toJSON()
  }
}

module.exports = (context, request) => validateTokenAuth(context, request, handleFile)
