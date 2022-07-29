const { verify } = require('azure-ad-verify-token')
const { AUTH, DEMO, DEMO_ACCESS_GROUPS, DEMO_USER, PAPERTRAIL_DISABLE_LOGGING } = require('../config')
const { logConfig, logger } = require('@vtfk/logger')
const getAccessGroups = require('./get-access-groups')
const HTTPError = require('./http-error')

module.exports = async (context, request, next) => {
  const { id } = request.params

  logConfig({
    azure: {
      context
    },
    remote: {
      disabled: PAPERTRAIL_DISABLE_LOGGING,
      onlyInProd: false
    },
    error: {
      useMessage: true
    }
  })

  if (DEMO) {
    logConfig({
      prefix: `DEMO - ${DEMO_USER}${id ? ` - ${id}` : ''}`
    })

    request.token = {
      groups: getAccessGroups(DEMO_ACCESS_GROUPS),
      upn: DEMO_USER
    }
    logger('info', ['validate-token-auth', 'groups', request.token.groups])
    logger('info', ['validate-token-auth', 'accepted'])
    return next(context, request)
  }

  const { authorization } = request.headers
  if (!authorization) {
    logger('error', ['validate-token-auth', 'authorization header missing'])
    return new HTTPError(400, 'Authorization header is missing').toJSON()
  }

  try {
    const token = authorization.replace('Bearer ', '')
    const validatedToken = await verify(token, AUTH)
    request.token = validatedToken
    logConfig({
      prefix: `${validatedToken.upn}${id ? ` - ${id}` : ''}`
    })
    request.token.groups = getAccessGroups(validatedToken.groups || [])
    logger('info', ['validate-token-auth', 'groups', request.token.groups])
    logger('info', ['validate-token-auth', 'accepted'])
    return next(context, request)
  } catch (error) {
    logger('error', ['validate-token-auth', 'invalid authorization token', error])
    return new HTTPError(401, 'Authorization token invalid').toJSON()
  }
}
