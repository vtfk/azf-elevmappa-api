const jwt = require('jsonwebtoken')
const pkg = require('../package.json')

module.exports = settings => {
  const payload = {
    system: pkg.name,
    version: pkg.version
  }

  if (settings.upn) {
    payload.caller = settings.upn
  }

  const options = {
    expiresIn: '1m',
    issuer: 'https://auth.vtfk.no'
  }

  return `Bearer ${jwt.sign(payload, settings.secret, options)}`
}
