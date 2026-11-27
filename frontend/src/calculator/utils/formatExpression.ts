import type { Span } from './calculatorFeedback'

const displayOperators: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
}
const expressionToken = /\d+(?:\.\d*)?(?:E\+\d+)?|\.\d*|[+*/-]/g

export function formatExpression(expression: string) {
  return expression
    .replace(expressionToken, (token, index: number) => {
      const symbol = displayOperators[token]
      if (!symbol) {
        return token.replace(/^\d+/, (integer) =>
          integer.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        )
      }

      const isBinary = /[\d.)%]/.test(expression[index - 1] ?? '')
      return isBinary ? ` ${symbol} ` : symbol
    })
    .trimEnd()
}

// Formatting adds only spaces and thousands separators, one glyph per source character.
function rawOffset(formatted: string, position: number) {
  return formatted.slice(0, position).replace(/[ ,]/g, '').length
}

export function displaySpan(formatted: string, { start, end }: Span): Span {
  const indices = Array.from(
    formatted.matchAll(/[^ ,]/g),
    (match) => match.index,
  )
  const left = indices[start] ?? formatted.length
  return {
    start: left,
    end: end === start ? left : (indices[end - 1] ?? formatted.length - 1) + 1,
  }
}

export function rawSpan(value: string, { start, end }: Span): Span {
  return { start: rawOffset(value, start), end: rawOffset(value, end) }
}
