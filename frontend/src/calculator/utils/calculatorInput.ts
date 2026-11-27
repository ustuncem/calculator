import type { CalculatorError, Span } from './calculatorFeedback'

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

const maxDigitsPerLiteral = 15
const maxOperands = 40
const maxNesting = 32

const operandEnd = /[\d.)]$/
const isOperator = (key: string) => /^[+*/-]$/.test(key)
type EditKey = Exclude<CalculatorKey, 'AC' | '%' | '='>

function updatePrefix(expression: string, key: EditKey): string {
  switch (key) {
    case 'Backspace':
      return expression.slice(0, -1)
    case '()': {
      const openGroups =
        expression.split('(').length - expression.split(')').length

      if (operandEnd.test(expression)) {
        return openGroups > 0 ? `${expression})` : expression
      }
      return `${expression}(`
    }
    case '±':
      return expression.replace(
        /(?<![\d.)])([+-]?)([\d.]*)$/,
        (_, sign, number) => (sign === '-' ? number : `-${number}`),
      )
    default:
      return !isOperator(key) && expression.endsWith(')')
        ? expression
        : expression + key
  }
}

type Result = { expression: string; result: string }

export type Draft = {
  text: string
  base?: Result
  caret?: number
  error?: CalculatorError
}

export function resultDraft(base: Result): Draft {
  return { base, text: '' }
}

export function visibleExpression({ text, base }: Draft) {
  return (base?.result ?? '') + text
}

function submittedExpression({ text, base }: Draft) {
  return base ? `(${base.expression})${text}` : text
}

export function calculationInput(draft: Draft) {
  if (!draft.text) return
  return {
    expression: submittedExpression(draft),
    label: visibleExpression(draft),
  }
}

export function rejectCalculation(draft: Draft, error: CalculatorError): Draft {
  if (!draft.base || error.kind !== 'request' || !error.span)
    return { ...draft, error }

  const prefixLength = draft.base.expression.length + 2
  const { start, end } = error.span
  // An error in the hidden expression needs the original group on screen.
  if (start < prefixLength) return { text: submittedExpression(draft), error }

  const offset = draft.base.result.length - prefixLength
  return {
    ...draft,
    error: { ...error, span: { start: start + offset, end: end + offset } },
  }
}

function checkLimits(expression: string): CalculatorError | undefined {
  const numbers = expression.match(/[\d.]+/g) ?? []
  if (
    numbers.some(
      (number) => number.replace('.', '').length > maxDigitsPerLiteral,
    )
  ) {
    return { kind: 'digits', limit: maxDigitsPerLiteral }
  }
  if (numbers.length > maxOperands)
    return { kind: 'operands', limit: maxOperands }

  let depth = 0
  for (const ch of expression) {
    if (ch === '(' && ++depth > maxNesting)
      return { kind: 'nesting', limit: maxNesting }
    if (ch === ')') depth--
  }
}

export function editDraft(
  draft: Draft,
  key: CalculatorKey,
  selection: Span,
): Draft {
  const current = { ...draft, error: undefined }
  if (key === 'AC') return { text: '' }
  if (key === '%' || key === '=') return current

  let { text, base } = draft
  let { start, end } = selection
  const baseLength = base?.result.length ?? 0

  if (base && !text && key !== 'Backspace') {
    if (isOperator(key)) {
      start = end = baseLength
    } else {
      base = undefined
      start = end = 0
    }
  }
  if (
    base &&
    (start < baseLength ||
      (key === 'Backspace' && start === end && start === baseLength))
  ) {
    text = base.result + text
    base = undefined
  }
  const offset = base ? baseLength : 0
  const before = text.slice(0, start - offset)
  const after = text.slice(end - offset)
  const prefix =
    key === 'Backspace' && start !== end ? before : updatePrefix(before, key)
  if (prefix === before && key !== 'Backspace') return current

  if (key === '.' && (/\.[\d.]*$/.test(before) || /^[\d.]*\./.test(after)))
    return current

  const next: Draft = {
    base,
    text: prefix + after,
    caret: offset + prefix.length,
  }
  const submitted = submittedExpression(next)
  if (key !== 'Backspace') {
    const error = checkLimits(submitted)
    if (error)
      return base ? { ...resultDraft(base), error } : { ...current, error }
  }
  // Removing the joining operator exposes the original group for further editing.
  if (base && next.text && !isOperator(next.text[0])) {
    return { text: submitted, caret: submitted.length - after.length }
  }
  return next
}
