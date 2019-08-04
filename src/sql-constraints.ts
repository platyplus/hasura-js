import get from 'lodash.get'
import { parse } from 'pg-query-native'
import { getOperator } from './operators'
interface IDataObject {
  [key: string]: any
}

type ExpressionProcessor = (exp: any, data?: IDataObject) => boolean // TODO specify 'any'
interface IExpressionSelector {
  [key: string]: ExpressionProcessor | IExpressionSelector
}

const functionProcessors: IExpressionSelector = {
  length: value => value.length,
  pg_catalog: { similar_escape: value => value } // TODO to be tested
}

const constantValueProcessors: IExpressionSelector = {
  Integer: val => val.Integer.ival,
  String: val => val.String.str
}

const booleanProcessors: IExpressionSelector = {
  0: (exp, data) => exp.args.every((arg: any) => processExp(arg, data)), // AND
  1: (exp, data) => exp.args.some((arg: any) => processExp(arg, data)), // OR
  2: (exp, data) => !exp.args.every((arg: any) => processExp(arg, data)) // NOT
}

const errorFunction = (code: string) => (exp: any) => {
  throw new Error(`Error: ${code}. Exp: \n' ${JSON.stringify(exp, null, 4)}`)
}

const expressionProcessors: IExpressionSelector = {
  A_Expr: (exp, data) => {
    const operationName = exp.name[0].String.str
    const operation = getOperator(operationName) || errorFunction(`Operation ${operationName} not found`)
    // IN: expresion name: =, rexpr is an array
    const rightExpressions = Array.isArray(exp.rexpr) ? exp.rexpr : [exp.rexpr]
    return rightExpressions.some((rexpr: any) => operation(processExp(exp.lexpr, data), processExp(rexpr, data)))
  },
  BoolExpr: (exp, data) =>
    ((booleanProcessors[exp.boolop] as ExpressionProcessor) ||
      errorFunction(`Boolean expression ${exp.boolop} not found`))(exp, data),
  FuncCall: (exp, data) => {
    const funcNamesArray = Array.isArray(exp.funcname) ? exp.funcname : [exp.funcname]
    const functionPath = funcNamesArray.map((f: any) => f.String.str.toLowerCase()).join('.')
    const func =
      (get(functionProcessors, functionPath) as ExpressionProcessor) ||
      errorFunction(`Function ${functionPath} not found`)
    const value = processExp(exp.args[0], data) // TODO function with multiple args?
    if (value === undefined || value === null) {
      return false // TODO throw error instead?
    } else {
      return func(value)
    }
  },
  ColumnRef: (exp, data) => {
    const path = exp.fields.map((field: any) => field.String.str).join('.')
    return get(data, path)
  },
  A_Const: exp => {
    if (Object.keys(exp.val).length > 1) {
      return errorFunction('TODO: constant with multiple values')(exp)
    }
    const value =
      (constantValueProcessors[Object.keys(exp.val)[0]] as ExpressionProcessor) ||
      errorFunction(`ConstValue processor ${Object.keys(exp.val)[0]} not found`)
    return value(exp.val)
  },
  NullTest: (exp, data) => {
    const result = Boolean(processExp(exp.arg, data))
    switch (exp.nulltesttype) {
      case 0: // IS NULL
        return !result
      case 1: // IS NOT NULL
        return result
      default:
        return errorFunction(`Undefined null test ${exp.nulltesttype}`)(exp)
    }
  }
}

const processExp: ExpressionProcessor = (expression, data) => {
  const expressionType = Object.keys(expression)[0]
  const processor =
    (expressionProcessors[expressionType] as ExpressionProcessor) ||
    errorFunction(`Expression Type ${expressionType} not found`)
  return processor(expression[expressionType], data)
}

export function validateConstraint(constraint: string, dataObject: IDataObject) {
  const prefix = 'select 1 where '
  const expression = parse(prefix + constraint).query[0].SelectStmt.whereClause
  return processExp(expression, dataObject)
}

// TODO Test castings such as '::text' -> remove before processing?
