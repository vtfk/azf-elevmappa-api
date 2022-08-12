const getPropName = prop => {
  prop = prop.toLowerCase()

  if (prop === 'baseurl') return 'baseUrl'
  if (prop === 'statuscodes') return 'statusCodes'
  if (prop === 'excludedenterprises') return 'excludedEnterprises'
  if (prop === 'disablefiles') return 'disableFiles'

  return prop
}

const getPropValue = (prop, value) => {
  if (['true', 'false'].includes(value.toLowerCase())) return value.toLowerCase() === 'true'
  if (prop === 'statuses') return value.split(',')
  if (prop === 'statusCodes') return value.split(',').map(code => code.toUpperCase())
  if (prop === 'excludedEnterprises') return value.split(',').map(code => Number.parseInt(code)).filter(code => !isNaN(code))

  return value
}

const getActiveSources = () => {
  const sourceKeys = Object.keys(process.env).filter(key => key.startsWith('P360_'))
  const sources = []

  // find and build all sources
  sourceKeys.forEach(key => {
    const keyParts = key.split('_', 3) // we only import the 3 first parts, and use only the 2 last parts of these 3
    const internal = keyParts[1]
    const prop = getPropName(keyParts[2])
    const value = getPropValue(prop, process.env[key])
    const sourceObj = sources.find(source => source.internal === internal)
    if (sourceObj) {
      // source object is already created, fill it up
      sourceObj[prop] = value
    } else {
      // create source object
      const newSourceObj = {
        internal,
        statuses: ['Under behandling'],
        statusCodes: ['J', 'E', 'F'],
        excludedEnterprises: [],
        disableFiles: false
      }
      newSourceObj[prop] = value
      sources.push(newSourceObj)
    }
  })

  // return only enabled sources
  return sources.filter(source => source.enabled)
}

module.exports = {
  AUTH: {
    jwksUri: process.env.AUTH_JWK_URI || 'https://login.microsoftonline.com/08f3813c-9f29-482f-9aec-16ef7cbf477a/discovery/v2.0/keys',
    issuer: process.env.AUTH_ISS || undefined,
    audience: process.env.AUTH_AUD || process.env.AUTH_CLIENT_ID || undefined
  },
  ACCESS_GROUP_PREFIX: process.env.ACCESS_GROUP_PREFIX || 'OF-',
  ACCESS_GROUP_POSTFIX: process.env.ACCESS_GROUP_POSTFIX || 'TILGANGELEVMAPPA',
  DEMO: (process.env.DEMO && process.env.DEMO === 'true') || false,
  DEMO_ACCESS_GROUPS: (process.env.DEMO_ACCESS_GROUPS && process.env.DEMO_ACCESS_GROUPS.split(',')) || [],
  DEMO_USER: process.env.DEMO_USER || undefined,
  MONGODB_CONNECTION: process.env.MONGODB_CONNECTION,
  MONGODB_COLLECTION: process.env.MONGODB_COLLECTION,
  MONGODB_NAME: process.env.MONGODB_NAME,
  PAPERTRAIL_DISABLE_LOGGING: (process.env.PAPERTRAIL_DISABLE_LOGGING && process.env.PAPERTRAIL_DISABLE_LOGGING === 'true') || false,
  PIFU: {
    URL: process.env.PIFU_URL,
    JWT_SECRET: process.env.PIFU_JWT_SECRET
  },
  P360: getActiveSources()
}
