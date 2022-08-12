const { logger } = require('@vtfk/logger')
const p360 = require('./archive/p360')
const config = require('../config')

module.exports = async fnr => {
  logger('info', ['retrieve-documents', 'start'])

  // loop and gather documents from all P360 environments
  const documentList = []
  await Promise.all(config.P360.map(async (source) => {
    logger('info', ['retrieve-documents', source.name, source.disableFiles ? 'file retrieval not allowed' : ''])

    try {
      const client = p360(source)
      const { documents } = await client.getDocuments(fnr)
      if (!documents) {
        logger('info', ['retrieve-documents', source.name, 'no documents found'])
        return
      }

      logger('info', ['retrieve-documents', source.name, 'documents', documents.length])

      // append source system to the document
      documents.forEach(doc => {
        documentList.push({ source: source.name, ...doc })
      })
    } catch (error) {
      logger('error', ['retrieve-documents', source.name, error])
    }
  }))

  if (documentList && documentList.length === 0) {
    logger('warn', ['retrieve-documents', 'no documents found'])
  } else {
    logger('info', ['retrieve-documents', 'documents', documentList.length])
  }

  return documentList
}
