module.exports = (file) => {
  return {
    title: file.Title,
    recno: file.Recno,
    relation: file.RelationTypeDescription
  }
}
