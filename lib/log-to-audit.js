const mongo = require('./get-mongo')
const { DEMO, MONGODB_SKIP_AUDIT } = require('../config')

module.exports = async (upn, id, route, message, accessType) => {
  if (DEMO || MONGODB_SKIP_AUDIT) return `disabled (${accessType})`

  const data = {
    teacher: upn,
    student: id,
    route,
    timestamp: new Date().getTime(),
    message,
    accessType
  }

  const db = mongo()
  const result = await db.insertOne(data)
  return result
}
