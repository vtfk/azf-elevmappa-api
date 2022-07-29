const { MongoClient } = require('mongodb')
const { logger } = require('@vtfk/logger')
const { MONGODB_CONNECTION, MONGODB_COLLECTION, MONGODB_NAME } = require('../config')

let client = null

const initializeClient = async () => {
  client = new MongoClient(MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  logger('info', ['get-mongo', 'client initialized'])
  return client.db(MONGODB_NAME).collection(MONGODB_COLLECTION)
}

module.exports = async () => {
  if (!MONGODB_CONNECTION) {
    logger('error', ['get-mongo', 'missing MONGODB_CONNECTION'])
    throw new Error('Missing MONGODB_CONNECTION')
  }

  if (!client) {
    logger('info', ['get-mongo', 'client not created'])
    return await initializeClient()
  } else if (client.isConnected()) {
    logger('info', ['get-mongo', 'client already connected'])
    return client.db(MONGODB_NAME).collection(MONGODB_COLLECTION)
  } else {
    logger('warn', ['get-mongo', 'mongo connection lost', 'client discarded'])
    return await initializeClient()
  }
}
