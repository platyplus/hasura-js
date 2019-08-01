import get from 'lodash.get'
import { getHasuraOperator } from './operators'
import { validateConstraint } from './sql-constraints'

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

export const generateSqlConstraints = (expression: any, environment: any): string => {
  const operand = Object.keys(expression)[0]
  switch (operand) {
    case '_and':
      return `(${(expression as IAndFilter)._and
        .map(element => generateSqlConstraints(element, environment))
        .join(' and ')})`
    case '_or':
      return `(${(expression as IOrFilter)._or
        .map(element => generateSqlConstraints(element, environment))
        .join(' or ')})`
    case '_not':
      return `NOT (${generateSqlConstraints((expression as INotFilter)._not, environment)})`
    default:
      const subExpression = expression[operand]
      const hasuraOperand = getHasuraOperator(operand)
      if (hasuraOperand) {
        let environmentValue = get(environment, subExpression)
        if (typeof environmentValue === 'string') {
          environmentValue = `"${environmentValue}"`
        }
        return ` ${hasuraOperand} ${environmentValue}`
      } else if (getHasuraOperator(Object.keys(subExpression)[0])) {
        return `${operand}${generateSqlConstraints(subExpression, environment)}`
      } else {
        return `${operand}.${generateSqlConstraints(subExpression, environment)}`
      }
  }
}

export const validateFilter = (value: any, expression: any, environment: any): boolean =>
  validateConstraint(generateSqlConstraints(expression, environment), value)
