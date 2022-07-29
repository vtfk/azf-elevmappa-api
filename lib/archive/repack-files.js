const getContacts = require('./get-contacts')

module.exports = (documentItem, contacts, file) => {
  const documentDate = documentItem.DocumentDate || documentItem.JournalDate
  return {
    from: getContacts(contacts, 'Avsender') || '',
    to: getContacts(contacts, 'Mottaker') || '',
    date: new Date(documentDate).toISOString().split('T')[0],
    category: file.CategoryDescription,
    title: file.Title,
    file: documentItem.DocumentNumber,
    recno: file.Recno
  }
}
