const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const generateToken = require('./generate-token')
const { PIFU: { URL, JWT_SECRET } } = require('../config')

module.exports = async (upn, endpoint) => {
  logger('info', ['get-pifu-data', endpoint])

  const settings = {
    secret: JWT_SECRET,
    upn
  }

  const url = `${URL}/${endpoint}`
  const token = generateToken(settings)

  const options = {
    headers: {
      Authorization: token
    }
  }

  const { data } = await axios.get(url, options)
  return data
}
