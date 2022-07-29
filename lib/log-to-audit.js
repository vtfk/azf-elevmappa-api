const mongo = require('./get-mongo')
const { DEMO } = require('../config')

module.exports = async (upn, id, route, message, accessType) => {
  if (DEMO) return `disabled (${accessType})`

  const data = {
    teacher: upn,
    student: id,
    route,
    timestamp: new Date().getTime(),
    message,
    accessType
  }

  const db = await mongo()
  const result = await db.insertOne(data)
  return result
}
