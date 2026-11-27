const calculatorKeys = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '.',
  '+',
  '-',
  '*',
  '/',
  'AC',
  '()',
  '±',
  '%',
  '=',
  'Backspace',
] as const

export type CalculatorKey = (typeof calculatorKeys)[number]
export type LimitError = { message: string }

export function getKeyboardCalculatorKey(
  key: string,
): CalculatorKey | undefined {
  switch (key) {
    case 'Escape':
      return 'AC'
    case 'Enter':
      return '='
    case '(':
    case ')':
      return '()'
    default:
      return calculatorKeys.find((calculatorKey) => calculatorKey === key)
  }
}

const maxDigitsPerLiteral = 15
const maxOperands = 40
const maxNesting = 32

const operandEnd = /[\d.)]$/
const displayOperators: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
}

export function updateExpression(
  expression: string,
  key: CalculatorKey,
): string | LimitError {
  switch (key) {
    case 'AC':
      return ''
    case 'Backspace':
      return expression.slice(0, -1)
    case '%':
    case '=':
      return expression
    case '()': {
      const openGroups =
        expression.split('(').length - expression.split(')').length

      if (operandEnd.test(expression)) {
        return openGroups > 0 ? `${expression})` : expression
      }
      if (openGroups >= maxNesting) {
        return { message: `Use at most ${maxNesting} nested groups.` }
      }
      return `${expression}(`
    }
    case '±':
      return expression.replace(
        /(?<![\d.)])([+-]?)([\d.]*)$/,
        (_, sign, number) => (sign === '-' ? number : `-${number}`),
      )
    case '+':
    case '-':
    case '*':
    case '/':
      return expression + key
    default: {
      if (expression.endsWith(')')) return expression

      const literal = expression.match(/[\d.]+$/)?.[0] ?? ''
      const digits = literal.replace('.', '').length
      if (key === '.' && literal.includes('.')) return expression
      if (key !== '.' && digits >= maxDigitsPerLiteral) {
        return {
          message: `Use at most ${maxDigitsPerLiteral} digits per number.`,
        }
      }

      if (digits === 0) {
        const operands = expression.match(/\d+(?:\.\d*)?|\.\d+/g)?.length ?? 0
        if (operands >= maxOperands) {
          return {
            message: `Use at most ${maxOperands} numbers per expression.`,
          }
        }
      }

      return expression + key
    }
  }
}

export function formatExpression(expression: string) {
  return expression
    .replace(/\d+(?:\.\d*)?|\.\d*|[+*/-]/g, (token, index: number) => {
      const symbol = displayOperators[token]
      if (!symbol) {
        return token.replace(/^\d+/, (integer) =>
          integer.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        )
      }

      const isBinary = operandEnd.test(expression[index - 1] ?? '')
      return isBinary ? ` ${symbol} ` : symbol
    })
    .trimEnd()
}
