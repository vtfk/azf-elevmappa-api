const { logger } = require('@vtfk/logger')
const HTTPError = require('../lib/http-error')
const validateTokenAuth = require('../lib/validate-token-auth')
const generateResponse = require('../lib/generate-response')
const { getStudent } = require('../lib/handler')

const handleStudent = async (context, req) => {
  const { groups, upn } = req.token
  const { id } = req.params

  if (!upn) {
    logger('error', ['handleStudent', 'upn missing', upn])
    return new HTTPError(400, 'upn missing').toJSON()
  }

  try {
    logger('info', ['handleStudent', 'get student'])
    const student = await getStudent(upn, id, groups)
    return generateResponse(student || { message: 'not found' }, student ? 200 : 404)
  } catch (error) {
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, error.message, error).toJSON()
  }
}

module.exports = (context, request) => validateTokenAuth(context, request, handleStudent)
