const { logger } = require('@vtfk/logger')
const HTTPError = require('../lib/http-error')
const validateTokenAuth = require('../lib/validate-token-auth')
const generateResponse = require('../lib/generate-response')
const { getStudents } = require('../lib/handler')

const handleStudents = async (context, req) => {
  const { groups, upn } = req.token

  if (!upn) {
    logger('error', ['handleStudents', 'upn missing', upn])
    return new HTTPError(400, 'upn missing').toJSON()
  }

  try {
    logger('info', ['handleStudents', 'get my students'])
    const students = await getStudents(upn, groups)
    return generateResponse(students || [])
  } catch (error) {
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, error.message, error).toJSON()
  }
}

module.exports = (context, request) => validateTokenAuth(context, request, handleStudents)
