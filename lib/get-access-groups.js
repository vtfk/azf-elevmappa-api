const { logger } = require('@vtfk/logger')
const { ACCESS_GROUP_PREFIX, ACCESS_GROUP_POSTFIX } = require('../config')

module.exports = groups => {
  logger('info', ['get-access-groups', 'start'])
  const filteredGroups = (groups && groups.filter(group => group.toUpperCase().includes(ACCESS_GROUP_POSTFIX.toUpperCase()) && group.toUpperCase().includes(ACCESS_GROUP_PREFIX.toUpperCase()))) || []
  const fixedGroups = filteredGroups.map(group => group.toUpperCase().replace(ACCESS_GROUP_PREFIX, ''))
  logger('info', ['get-access-groups', 'finish', groups.length, fixedGroups.length])
  return fixedGroups
}
