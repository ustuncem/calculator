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

const operandEnd = /[\d.)]$/
const displayOperators: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
}

export function updateExpression(expression: string, key: CalculatorKey) {
  switch (key) {
    case 'AC':
      return ''
    case 'Backspace':
      return expression.slice(0, -1)
    case '%':
    case '=':
      return expression
    case '()': {
      if (!operandEnd.test(expression)) return `${expression}(`

      const openGroups =
        expression.split('(').length - expression.split(')').length
      return openGroups > 0 ? `${expression})` : expression
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
    default:
      if (expression.endsWith(')')) return expression
      if (key === '.' && /\.\d*$/.test(expression)) return expression
      return expression + key
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
