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

const operandEnd = /[\d.)%]$/
const isOperator = (key: string) => /^[+*/-]$/.test(key)
const isContinuation = (key: string) => isOperator(key) || key === '%'
type EditKey = Exclude<CalculatorKey, 'AC' | '='>

function updatePrefix(expression: string, key: EditKey): string {
  switch (key) {
    case 'Backspace':
      return expression.slice(0, -1)
    case '%':
      return expression + key
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
        /(?<![\d.)%])([+-]?)([\d.]+%?)?$/,
        (_, sign, number = '') => (sign === '-' ? number : `-${number}`),
      )
    default:
      return !isOperator(key) && /[)%]$/.test(expression)
        ? expression
        : expression + key
  }
}

type SubmittedExpression = { expression: string; label: string }
export type CalculationInput = SubmittedExpression & {
  // Reversing a result sign can reuse the original expression without nesting another group.
  opposite?: SubmittedExpression
}
export type Calculation = CalculationInput & {
  result: string
  rounded: boolean
}

export type Draft = { caret?: number; error?: CalculatorError } & (
  | { mode: 'editing'; text: string }
  | { mode: 'result'; base: Calculation }
  | { mode: 'continuing'; base: Calculation; text: string }
)

export function editingDraft(text = ''): Draft {
  return { mode: 'editing', text }
}

export function resultDraft(base: Calculation): Draft {
  return { mode: 'result', base }
}

export function visibleExpression(draft: Draft) {
  switch (draft.mode) {
    case 'editing':
      return draft.text
    case 'result':
      return draft.base.result
    case 'continuing':
      return draft.base.result + draft.text
  }
}

function groupedExpression(base: Calculation) {
  return `(${base.expression})`
}

export function calculationInput(draft: Draft): CalculationInput | undefined {
  switch (draft.mode) {
    case 'result':
      return
    case 'editing':
      if (!draft.text) return
      return { expression: draft.text, label: draft.text }
    case 'continuing':
      return {
        expression: groupedExpression(draft.base) + draft.text,
        label: visibleExpression(draft),
      }
  }
}

export function oppositeSignInput(base: Calculation): CalculationInput {
  const opposite = base.opposite ?? {
    expression: '-' + groupedExpression(base),
    label: `-(${base.label})`,
  }
  return {
    ...opposite,
    opposite: { expression: base.expression, label: base.label },
  }
}

export function rejectCalculation(draft: Draft, error: CalculatorError): Draft {
  if (error.kind !== 'request' || !error.span || draft.mode === 'editing')
    return { ...draft, error }
  // A rejected sign change describes the hidden source of an unchanged result.
  if (draft.mode === 'result') {
    return { ...draft, error: { ...error, span: undefined } }
  }

  const prefix = groupedExpression(draft.base)
  const { start, end } = error.span
  if (start < prefix.length) {
    return { ...editingDraft(prefix + draft.text), error }
  }

  const offset = draft.base.result.length - prefix.length
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
  if (key === 'AC') return editingDraft()
  if (key === '=') return current

  let { start, end } = selection
  let text = draft.mode === 'result' ? '' : draft.text
  let base = draft.mode === 'editing' ? undefined : draft.base

  if (draft.mode === 'result' && key !== 'Backspace') {
    if (key === '±') return current // The calculation request owns result negation.
    if (isContinuation(key)) {
      start = end = draft.base.result.length
    } else {
      base = undefined
      start = end = 0
    }
  }

  if (base) {
    const length = base.result.length
    if (
      start < length ||
      (key === 'Backspace' && start === end && start === length)
    ) {
      if (base.result.includes('E')) {
        // A scientific result is an indivisible display value, outside the input grammar.
        start = 0
        end = Math.max(0, end - length)
      } else {
        text = base.result + text
      }
      base = undefined
    }
  }

  const offset = base?.result.length ?? 0
  const before = text.slice(0, start - offset)
  const after = text.slice(end - offset)
  if (key === '%') {
    const hasOperand = (base && !before) || /(?:\d\.?|\))$/.test(before)
    if (!hasOperand || /^[\d.(%]/.test(after)) return draft
  }
  const prefix =
    key === 'Backspace' && start !== end ? before : updatePrefix(before, key)
  if (prefix === before && key !== 'Backspace') return current
  if (key === '.' && (/\.[\d.]*$/.test(before) || /^[\d.]*\./.test(after)))
    return current

  text = prefix + after
  const caret = offset + prefix.length
  if (base && !text) return resultDraft(base)

  const submitted = base ? groupedExpression(base) + text : text
  if (key !== 'Backspace') {
    const error = checkLimits(submitted)
    if (error) return { ...(base ? resultDraft(base) : current), error }
  }
  if (!base) return { mode: 'editing', text, caret }
  // Removing the continuation operator exposes the original group for further editing.
  if (!isContinuation(text[0])) {
    return {
      mode: 'editing',
      text: submitted,
      caret: submitted.length - after.length,
    }
  }
  return { mode: 'continuing', base, text, caret }
}
