const dayjs = require('dayjs')
const repackFiles = require('./repack-files')

module.exports = (documentItem, contacts, files) => {
  const date = documentItem.DocumentDate || documentItem.JournalDate
  const displayDate = date ? dayjs(date).format('DD.MM.YYYY') : ''
  return {
    id: documentItem.DocumentNumber,
    date,
    displayDate,
    sortId: documentItem.DocumentNumber.match(/\d/g).join(''),
    docId: documentItem.DocumentNumber,
    title: documentItem.Title,
    files: files.map(file => repackFiles(documentItem, contacts, file))
  }
}
