import { expect, test } from 'vitest'

import {
  calculationInput,
  type CalculatorKey,
  type Draft,
  editDraft,
  editingDraft,
  getKeyboardCalculatorKey,
  rejectCalculation,
  resultDraft,
  visibleExpression,
} from '../calculatorInput'

function press(
  draft: Draft,
  key: CalculatorKey,
  start = visibleExpression(draft).length,
  end = start,
) {
  return editDraft(draft, key, { start, end })
}

test.each([
  ['Enter', '='],
  ['Escape', 'AC'],
  ['(', '()'],
  [')', '()'],
  ['/', '/'],
  ['Backspace', 'Backspace'],
  ['Tab', undefined],
])('maps the keyboard key %s to %s', (key, expected) => {
  expect(getKeyboardCalculatorKey(key)).toBe(expected)
})

test('inserts at the caret and replaces a selected range', () => {
  const inserted = press(editingDraft('12+34'), '0', 4)
  expect(inserted).toMatchObject({ text: '12+304', caret: 5 })
  expect(press(inserted, '9', 3, 6)).toMatchObject({ text: '12+9', caret: 4 })
})

test('backspace deletes the selection or the character before the caret', () => {
  const draft = editingDraft('12+34')
  expect(press(draft, 'Backspace', 1, 4)).toMatchObject({
    text: '14',
    caret: 1,
  })
  expect(press(draft, 'Backspace', 2)).toMatchObject({ text: '1+34', caret: 1 })
})

test('allows a decimal point in a new operand and prevents duplicates on either side', () => {
  expect(visibleExpression(press(editingDraft('1.2+'), '.'))).toBe('1.2+.')
  expect(visibleExpression(press(editingDraft('12.3'), '.', 1))).toBe('12.3')
  expect(visibleExpression(press(editingDraft('12.3'), '.'))).toBe('12.3')
})

test('opens and closes groups and prevents implicit multiplication after a group', () => {
  expect(visibleExpression(press(editingDraft('2*'), '()'))).toBe('2*(')
  const closed = press(editingDraft('2*(3+4'), '()')
  expect(visibleExpression(closed)).toBe('2*(3+4)')
  expect(visibleExpression(press(closed, '()'))).toBe('2*(3+4)')
  expect(visibleExpression(press(closed, '2'))).toBe('2*(3+4)')
  expect(visibleExpression(press(closed, '*'))).toBe('2*(3+4)*')
})

test('toggles the operand sign without changing a binary operator', () => {
  const negative = press(editingDraft('2+3'), '±')
  expect(visibleExpression(negative)).toBe('2+-3')
  expect(visibleExpression(press(negative, '±'))).toBe('2+3')
})

test('inserts a percentage only after a complete operand at the caret', () => {
  for (const text of ['', '2+', '(', '.', '10%']) {
    const draft = editingDraft(text)
    expect(press(draft, '%')).toEqual(draft)
  }

  const draft = editingDraft('10+20')
  expect(press(draft, '%', 1)).toEqual(draft)
  expect(press(draft, '%', 2)).toMatchObject({ text: '10%+20', caret: 3 })
  expect(press(editingDraft('5.'), '%')).toMatchObject({ text: '5.%' })

  const percent = press(editingDraft('(10'), '%')
  expect(visibleExpression(press(percent, '2'))).toBe('(10%')
  expect(visibleExpression(press(percent, '±'))).toBe('(-10%')
  expect(visibleExpression(press(percent, '()'))).toBe('(10%)')
})

test('counts typed digits including zeros, even when a sign and point are present', () => {
  const accepted = press(editingDraft('-00000000.000000'), '0')
  expect(visibleExpression(accepted)).toBe('-00000000.0000000')
  expect(press(accepted, '1')).toMatchObject({
    text: '-00000000.0000000',
    error: { kind: 'digits', limit: 15 },
  })
})

test('accepts the 40th operand and rejects the 41st', () => {
  const prefix = '1+'.repeat(39)
  const accepted = press(editingDraft(prefix), '2')
  expect(visibleExpression(accepted)).toBe(`${prefix}2`)
  const next = press(accepted, '+')
  expect(press(next, '3')).toMatchObject({
    text: `${prefix}2+`,
    error: { kind: 'operands', limit: 40 },
  })
})

test('allows 32 open groups and counts depth again after a group closes', () => {
  const accepted = press(editingDraft('('.repeat(31)), '()')
  expect(visibleExpression(accepted)).toBe('('.repeat(32))
  expect(press(accepted, '()')).toMatchObject({
    text: '('.repeat(32),
    error: { kind: 'nesting', limit: 32 },
  })
  const closed = `${'('.repeat(32)}1${')'.repeat(32)}+`
  expect(visibleExpression(press(editingDraft(closed), '()'))).toBe(
    `${closed}(`,
  )
})

test('clears validation feedback when the expression is edited or cleared', () => {
  const blocked = press(editingDraft('123456789012345'), '6')
  const corrected = press(blocked, 'Backspace')
  expect(visibleExpression(corrected)).toBe('12345678901234')
  expect(corrected.error).toBeUndefined()
  const cleared = press(blocked, 'AC')
  expect(visibleExpression(cleared)).toBe('')
  expect(cleared.error).toBeUndefined()
  expect(calculationInput(cleared)).toBeUndefined()
})

const previous = {
  expression: '1/3',
  label: '1/3',
  result: '0.333333333333333',
  rounded: true,
}

test('an operator continues with the grouped original expression and displays the result', () => {
  const result = resultDraft(previous)
  expect(calculationInput(result)).toBeUndefined()
  const continued = press(press(result, '*', 0), '3')
  expect(calculationInput(continued)).toEqual({
    expression: '(1/3)*3',
    label: '0.333333333333333*3',
  })
})

test('a digit starts a fresh expression after equals', () => {
  const draft = press(resultDraft(previous), '7')
  expect(calculationInput(draft)).toEqual({ expression: '7', label: '7' })
})

test('editing the visible result uses its digits as the new expression', () => {
  const draft = press(resultDraft(previous), 'Backspace')
  expect(calculationInput(draft)).toEqual({
    expression: '0.33333333333333',
    label: '0.33333333333333',
  })
})

test('deletes a scientific result as a single value when editing it', () => {
  const result = resultDraft({
    expression: '999999999999999+1',
    label: '999999999999999+1',
    rounded: false,
    result: '1E+15',
  })
  expect(press(result, 'Backspace')).toEqual({
    mode: 'editing',
    text: '',
    caret: 0,
  })

  const continued = press(press(result, '*'), '3')
  const edited = press(continued, 'Backspace', 1, 6)
  expect(calculationInput(edited)).toEqual({ expression: '3', label: '3' })
})

test('deleting the continuation operator exposes the original group', () => {
  const continued = press(press(resultDraft(previous), '*'), '3')
  const draft = press(continued, 'Backspace', 17, 18)
  expect(visibleExpression(draft)).toBe('(1/3)3')
  expect(draft.caret).toBe(5)
})

test('keeps the previous result when continuing would exceed the operand limit', () => {
  const result = resultDraft({
    expression: `${'1+'.repeat(39)}1`,
    label: '40 ones',
    rounded: false,
    result: '40',
  })
  const continued = press(result, '+')
  const blocked = press(continued, '1')
  expect(visibleExpression(blocked)).toBe('40')
  expect(blocked.error).toEqual({ kind: 'operands', limit: 40 })
  expect(calculationInput(blocked)).toBeUndefined()
})

test('highlights a rejected continuation in the visible expression', () => {
  const draft = press(press(resultDraft(previous), '/'), '0')
  const rejected = rejectCalculation(draft, {
    kind: 'request',
    detail: 'The divisor evaluates to zero.',
    span: { start: 5, end: 6 },
  })
  expect(visibleExpression(rejected)).toBe('0.333333333333333/0')
  expect(rejected.error).toMatchObject({ span: { start: 17, end: 18 } })
})

test('reveals the original group when the server highlights its hidden expression', () => {
  const draft = press(press(resultDraft(previous), '/'), '0')
  const error = {
    kind: 'request',
    detail: 'Correct the original expression.',
    span: { start: 2, end: 3 },
  } as const
  const rejected = rejectCalculation(draft, error)
  expect(visibleExpression(rejected)).toBe('(1/3)/0')
  expect(rejected.error).toEqual(error)
})

test('deleting the last continuation key restores the completed result mode', () => {
  const result = resultDraft(previous)
  const continued = press(result, '*')
  expect(continued.mode).toBe('continuing')
  expect(press(continued, 'Backspace')).toEqual(result)
})
