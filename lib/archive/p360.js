const SOAP = require('./p360-SOAP')
const RPC = require('./p360-RPC')

module.exports = options => {
  const client = options.type === 'SOAP' ? SOAP(options) : RPC({ host: options.baseUrl, authkey: options.token, ...options })

  return {
    getDocuments: (fnr) => client.getDocuments(fnr),
    getFiles: (documentId, recno) => client.getFiles(documentId, recno)
  }
}
