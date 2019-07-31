import get from 'lodash.get'

interface IEqOperator {
  _eq: string
}
interface INeOperator {
  _ne: string
}
interface IInOperator {
  _in: string[]
}
interface INinOperator {
  _nin: string[]
}
interface IGtOperator {
  _gt: string
}
interface ILtOperator {
  _lt: string
}
interface IGteOperator {
  _gte: string
}
interface ILteOperator {
  _lte: string
}
interface IIsNullOperator {
  _is_null: boolean
}
interface ILikeOperator {
  _like: string
}
interface INlikeOperator {
  _nlike: string
}
interface IIlikeOperator {
  _ilike: string
}
interface INilikeOperator {
  _nilike: string
}
interface ISimilarOperator {
  _similar: string
}
interface INsimilarOperator {
  _nsimilar: string
}

type IOperator =
  | IEqOperator
  | INeOperator
  | IInOperator
  | INinOperator
  | IGtOperator
  | ILtOperator
  | IGteOperator
  | ILteOperator
  | IIsNullOperator
  | ILikeOperator
  | INlikeOperator
  | IIlikeOperator
  | INilikeOperator
  | ISimilarOperator
  | INsimilarOperator
  | IValueFilter
  | string

interface IAndFilter {
  _and: IFilter[]
}
interface IOrFilter {
  _or: IFilter[]
}
interface INotFilter {
  _not: IFilter
}
interface IValueFilter {
  [key: string]: IOperator // TODO: allow only one single value
}
export type IFilter = IAndFilter | IOrFilter | INotFilter | IValueFilter

/**
 * Javascript equivalent to Postgres LIKE operator
 * See: https://stackoverflow.com/questions/1314045/emulating-sql-like-in-javascript
 * @param text
 * @param search
 */
export const isLike = (text: string, search: string, caseSentitive = true) => {
  if (typeof search !== 'string' || text === null) {
    return false
  }
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
const testValue = (
  value: any,
  currentTest: IFilter | IValueFilter,
  environment: any,
  initialPath: string = ''
): boolean => {
  const cursor = currentTest as any
  const field = Object.keys(currentTest)[0]
  if (Object.keys(currentTest).length !== 1) {
    throw Error(
      `The permission should contain only one property, ${
        Object.keys(currentTest).length
      } found\n Test: ${JSON.stringify(currentTest)}`
    )
  }
  const currentPath = initialPath ? `${initialPath}.${field}` : field
  const operand = Object.keys(cursor[field])[0]
  const variableName = cursor[field][operand]
  const fieldValue = get(value, currentPath)
  switch (operand) {
    case '_eq':
      return environment[variableName] === fieldValue
    case '_ne':
      return environment[variableName] !== fieldValue
    case '_in':
      return variableName.map((item: string) => environment[item]).includes(fieldValue)
    case '_nin':
      return !variableName.map((item: string) => environment[item]).includes(fieldValue)
    case '_gt':
      return fieldValue > environment[variableName]
    case '_lt':
      return fieldValue < environment[variableName]
    case '_gte':
      return fieldValue >= environment[variableName]
    case '_lte':
      return fieldValue <= environment[variableName]
    case '_is_null':
      return !Boolean(fieldValue)
    case '_like':
      return isLike(fieldValue, environment[variableName])
    case '_nlike':
      return !isLike(fieldValue, environment[variableName])
    case '_ilike':
      return isLike(fieldValue, environment[variableName], false)
    case '_nilike':
      return !isLike(fieldValue, environment[variableName], false)
    case '_similar':
      return isSimilar(fieldValue, environment[variableName])
    case '_nsimilar':
      return !isSimilar(fieldValue, environment[variableName])
    case undefined:
      return false
    default:
      return testValue(value, cursor[currentPath], environment, currentPath)
  }
}

export const checkFilter = (value: any, checkTest: IFilter, environment: any): boolean => {
  const test = checkTest as any
  const operand = Object.keys(test)[0]
  switch (operand) {
    case '_and':
      return test._and.every((subTest: IFilter) => checkFilter(value, subTest, environment))
    case '_or':
      return test._and.some((subTest: IFilter) => checkFilter(value, subTest, environment))
    case '_not':
      return !checkFilter(value, test._not, environment)
    default:
      return testValue(value, test, environment)
  }
}
