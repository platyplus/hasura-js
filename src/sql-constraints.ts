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

// TODO reuse operations from hasura-filters.ts?
// TODO use the same trick as in the function list to simplify
const OPERATIONS: IExpressionProcessorList = {
  and: (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) && processExp(exp.right, dataObject),
  or: (exp: IExpression, dataObject: IDataObject) =>
    processExp(exp.left, dataObject) || processExp(exp.right, dataObject),
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

// TODO reuse functions from hasura-filters.ts?
const FUNCTIONS: { [key: string]: (value: any) => any } = {
  length: (value: string) => value.length,
  not: (value: boolean) => !value
}

/** Gets the value of the literal in the data object.
 * E.g.
 * exp = {
 *  value: 'key'
 * }
 * dataObject = { key: 'value' }
 * Will return 'value'
 *
 * @param exp
 * @param dataObject
 */
const processLiteral = (exp: IExpression, dataObject: IDataObject) => dataObject[exp.value]

/** Gets the value in the expression
 * E.g.
 * exp = {
 *  value: 'a text'
 * }
 * Will return 'a text'
 *
 * @param exp
 * @param dataObject
 */
const processDefault = (exp: IExpression, dataObject: IDataObject) => exp.value

function processExp(expression: IExpression, dataObject: IDataObject): any {
  let processor
  if (expression instanceof nodes.Op) {
    // console.log(`Operation ${expression.operation}`)
    const operationName = expression.operation.toLowerCase()
    processor = OPERATIONS[operationName]
    if (!processor) {
      throw new Error(`Unknown operation: ${operationName}`)
    }
  } else if (expression instanceof nodes.FunctionValue) {
    // console.log('Function')
    const functionName = expression.name.toLowerCase()
    const func = FUNCTIONS[functionName]
    if (!func) {
      throw new Error(`Unknown function: ${functionName}`)
    }
    processor = (exp: IExpression, data: IDataObject) => func(processExp(exp.arguments.value[0], data))
  } else if (expression instanceof nodes.LiteralValue) {
    processor = processLiteral
  } else {
    processor = processDefault
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
