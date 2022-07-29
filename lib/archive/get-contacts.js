module.exports = (contacts, role) => {
  if (contacts && Array.isArray(contacts)) {
    const { SearchName } = contacts.find(contact => contact.Role === role) || {}
    return SearchName
  }
}
