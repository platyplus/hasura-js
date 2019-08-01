import { lexer, nodes, parser } from 'sql-parser'
import { getOperator } from './operators'
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
const processLiteral: ExpressionProcessor = (exp, dataObject) => dataObject[exp.value]

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
const processDefault: ExpressionProcessor = exp => exp.value

const processExp: ExpressionProcessor = (expression, data) => {
  if (expression instanceof nodes.Op) {
    const operationName = expression.operation.toLowerCase()
    const operation = getOperator(operationName)
    if (!operation) {
      throw new Error(`Unknown operation: ${operationName}`)
    }
    return operation(processExp(expression.left, data), processExp(expression.right, data))
  } else if (expression instanceof nodes.FunctionValue) {
    const functionName = expression.name.toLowerCase()
    const func = FUNCTIONS[functionName]
    if (!func) {
      throw new Error(`Unknown function: ${functionName}`)
    }
    const value = processExp(expression.arguments.value[0], data)
    if (value === undefined || value === null) {
      // TODO throw error instead?
      return false
    } else {
      return func(value)
    }
  } else if (expression instanceof nodes.LiteralValue) {
    return processLiteral(expression, data)
  } else {
    return processDefault(expression, data)
  }
}

export function validateConstraint(constraint: string, dataObject: IDataObject) {
  const prefix = 'select dummy from dummy where '
  const tokens = lexer.tokenize(prefix + constraint)
  const expression = parser.parse(tokens).where.conditions
  return processExp(expression, dataObject)
}

// TODO impossible to 'lexer' the string '::text' -> remove before processing?
