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

export const HASURA_OPERATORS: { [key: string]: string } = {
  _eq: '=',
  _ne: '!=',
  _in: 'in',
  _nin: 'nin',
  _gt: '>',
  _lt: '<',
  _gte: '>=',
  _lte: '<=',
  _is_null: 'is null',
  _like: 'like',
  _nlike: 'nlike',
  _ilike: 'ilike',
  _nilike: 'nilike',
  _similar: 'similar',
  _nsimilar: 'nsimilar'
}

const OPERATORS: { [key: string]: IOperation } = {
  and: (left, right) => left && right,
  or: (left, right) => left || right,
  '!=': (left, right) => left !== right,
  'is null': left => !Boolean(left), // TODO revoir
  like: (left, right) => isLike(left, right),
  nlike: (left, right) => !isLike(left, right),
  ilike: (left, right) => isLike(left, right, false),
  nilike: (left, right) => !isLike(left, right, false),
  similar: (left, right) => isSimilar(left, right),
  nsimilar: (left, right) => !isSimilar(left, right),
  '>': (left, right) => left > right,
  '>=': (left, right) => left >= right,
  '<': (left, right) => left < right,
  '<=': (left, right) => left <= right,
  '=': (left, right) => left === right,
  in: (left: string, right: [string]) => right.includes(left),
  nin: (left: string, right: [string]) => !right.includes(left)
}
/**
 * // TODO document
 * @param operand
 */
export const getOperator = (operand: string) => OPERATORS[operand]

/**
 * // TODO document
 * @param operand
 */
export const getHasuraOperator = (operand: string) => HASURA_OPERATORS[operand]

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
