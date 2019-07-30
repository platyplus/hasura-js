import { lexer, nodes, parser } from 'sql-parser'
// TODO work on types
interface IDataObject {
  [key: string]: any
}
interface IExpression {
  value: any
  left: IExpression
  right: IExpression
  arguments: {
    value: [IExpression]
  }
}

type ExpressionProcessor = (exp: IExpression, data: IDataObject) => boolean
interface IExpressionProcessorList {
  [key: string]: ExpressionProcessor
}

// TODO reuse operations from hasura-filters.ts
const OPERATIONS: IExpressionProcessorList = {
  and: (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) && processExp(exp.right, dataObject),
  '>': (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) > processExp(exp.right, dataObject),
  '>=': (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) >= processExp(exp.right, dataObject),
  '<': (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) < processExp(exp.right, dataObject),
  '<=': (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) <= processExp(exp.right, dataObject),
  '=': (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) === processExp(exp.right, dataObject)
}

// TODO reuse functions from hasura-filters.ts
const FUNCTIONS: IExpressionProcessorList = {
  length: (exp: IExpression, dataObject: IDataObject) => processExp(exp.arguments.value[0], dataObject).length
}

const processLitteral = (exp: IExpression, dataObject: IDataObject) => {
  if (typeof exp.value === 'string') {
    // console.log(`String: ${exp.value}`)
    return dataObject[exp.value]
  }
  return exp.value
}

// TODO should never be used
const processDefault = (exp: IExpression, dataObject: IDataObject) => {
  return exp.value
}

function processExp(expression: IExpression, dataObject: IDataObject) {
  let processor = processDefault
  if (expression instanceof nodes.Op) {
    // console.log(`Operation ${expression.operation}`)
    processor = OPERATIONS[expression.operation]
    if (!processor) {
      throw new Error(`Unknown operation: ${expression.operation}`)
    }
  } else if (expression instanceof nodes.FunctionValue) {
    // console.log('Function')
    processor = FUNCTIONS[expression.name]
    if (!processor) {
      throw new Error(`Unknown function: ${expression.name}`)
    }
  } else if (expression instanceof nodes.LiteralValue) {
    // console.log('Literal')
    processor = processLitteral
  }
  //   console.log(processor)
  try {
    return processor(expression, dataObject)
  } catch (error) {
    // example: length(undefined)
    return false
  }
}

export function checkConstraint(constraint: string, dataObject: IDataObject) {
  const prefix = 'select dummy from dummy where '
  const tokens = lexer.tokenize(prefix + constraint)
  const expression = parser.parse(tokens).where.conditions
  return processExp(expression, dataObject)
}

// TODO impossible to 'lexer' the string '::text' -> remove before processing?
