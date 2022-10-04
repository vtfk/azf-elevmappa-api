const { MongoClient } = require('mongodb')
const { logger } = require('@vtfk/logger')
const { MONGODB_CONNECTION, MONGODB_COLLECTION, MONGODB_NAME } = require('../config')

let client = null

const initializeClient = () => {
  client = new MongoClient(MONGODB_CONNECTION)
  logger('info', ['get-mongo', 'client initialized'])
  return client.db(MONGODB_NAME).collection(MONGODB_COLLECTION)
}

module.exports = () => {
  if (!MONGODB_CONNECTION) {
    logger('error', ['get-mongo', 'missing MONGODB_CONNECTION'])
    throw new Error('Missing MONGODB_CONNECTION')
  }

  if (!client) {
    return initializeClient()
  } else {
    logger('info', ['get-mongo', 'client already connected'])
    return client.db(MONGODB_NAME).collection(MONGODB_COLLECTION)
  }
}
