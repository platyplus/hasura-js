type IOperation = (left: any, right: any) => any

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

const OPERATORS: { [key: string]: IOperation } = {
  '<>': (left, right) => left !== right,
  // 'is null': left => !Boolean(left),
  // ilike: (left, right) => isLike(left, right, false),
  // similar: (left, right) => isSimilar(left, right),
  '~': (left, right) => Boolean(left.match(new RegExp(right))), // TODO not enough tested
  '~~': (left, right) => isLike(left, right),
  '>': (left, right) => left > right,
  '>=': (left, right) => left >= right,
  '<': (left, right) => left < right,
  '<=': (left, right) => left <= right,
  '=': (left, right) => left === right
}

/**
 * // TODO document
 * @param operand
 */
export const getOperator = (operand: string) => OPERATORS[operand]

/**
 * // TODO test and document
 * @param name
 * @param operation
 */
export const addOperator = (name: string, operation: IOperation) => {
  if (!OPERATORS[name]) {
    OPERATORS[name] = operation
  }
}
