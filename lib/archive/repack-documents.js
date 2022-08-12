const dayjs = require('dayjs')
const repackFiles = require('./repack-files')

module.exports = (documentItem, disableFiles) => {
  const date = documentItem.DocumentDate || documentItem.JournalDate
  const displayDate = date ? dayjs(date).format('DD.MM.YYYY') : ''
  return {
    accessCodeDescription: documentItem.AccessCodeDescription,
    contacts: documentItem.Contacts,
    category: documentItem.Category.Description,
    date,
    displayDate,
    disableFiles,
    documentNumber: documentItem.DocumentNumber,
    title: documentItem.Title,
    files: documentItem.Files.map(file => repackFiles(file))
  }
}
