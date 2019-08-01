import get from 'lodash.get'
import { getHasuraOperator } from './operators'

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
  // if (!operand) { // TODO really usefull?
  //   return false
  // }
  const operator = getHasuraOperator(operand)
  if (operator) {
    return operator(fieldValue, environment[variableName])
  } else {
    return testValue(value, cursor[currentPath], environment, currentPath)
  }
}

export const validateFilter = (value: any, checkTest: IFilter, environment: any): boolean => {
  const test = checkTest as any
  const operand = Object.keys(test)[0]
  switch (operand) {
    case '_and':
      return test._and.every((subTest: IFilter) => validateFilter(value, subTest, environment))
    case '_or':
      return test._and.some((subTest: IFilter) => validateFilter(value, subTest, environment))
    case '_not':
      return !validateFilter(value, test._not, environment)
    default:
      return testValue(value, test, environment)
  }
}
