/**
 * Javascript equivalent to Postgres LIKE operator
 * See: https://stackoverflow.com/questions/1314045/emulating-sql-like-in-javascript
 * @param text
 * @param search
 */
export const isLike = (text: string, search: string, caseSentitive = true) => {
  // Remove special chars
  search = search.replace(new RegExp('([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])', 'g'), '\\$1')
  // Replace % and _ with equivalent regex
  search = search.replace(/%/g, '.*').replace(/_/g, '.')
  // Check matches
  const flags = caseSentitive ? 'g' : 'gi'
  return RegExp('^' + search + '$', flags).test(text)
}

export const isSimilar = (text: string, search: string) => {
  // TODO Code - the following line is an incorrect workaround
  return isLike(text, search, false)
}
