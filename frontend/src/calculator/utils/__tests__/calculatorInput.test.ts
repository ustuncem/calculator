import { expect, test } from 'vitest'

import {
  calculationInput,
  type CalculatorKey,
  type Draft,
  editDraft,
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
  const inserted = press({ text: '12+34' }, '0', 4)
  expect(inserted).toMatchObject({ text: '12+304', caret: 5 })
  expect(press(inserted, '9', 3, 6)).toMatchObject({ text: '12+9', caret: 4 })
})

test('backspace deletes the selection or the character before the caret', () => {
  const draft = { text: '12+34' }
  expect(press(draft, 'Backspace', 1, 4)).toMatchObject({
    text: '14',
    caret: 1,
  })
  expect(press(draft, 'Backspace', 2)).toMatchObject({ text: '1+34', caret: 1 })
})

test('allows a decimal point in a new operand and prevents duplicates on either side', () => {
  expect(press({ text: '1.2+' }, '.').text).toBe('1.2+.')
  expect(press({ text: '12.3' }, '.', 1).text).toBe('12.3')
  expect(press({ text: '12.3' }, '.').text).toBe('12.3')
})

test('opens and closes groups and prevents implicit multiplication after a group', () => {
  expect(press({ text: '2*' }, '()').text).toBe('2*(')
  const closed = press({ text: '2*(3+4' }, '()')
  expect(closed.text).toBe('2*(3+4)')
  expect(press(closed, '()').text).toBe('2*(3+4)')
  expect(press(closed, '2').text).toBe('2*(3+4)')
  expect(press(closed, '*').text).toBe('2*(3+4)*')
})

test('toggles the operand sign without changing a binary operator', () => {
  const negative = press({ text: '2+3' }, '±')
  expect(negative.text).toBe('2+-3')
  expect(press(negative, '±').text).toBe('2+3')
})

test('counts typed digits including zeros, even when a sign and point are present', () => {
  const accepted = press({ text: '-00000000.000000' }, '0')
  expect(accepted.text).toBe('-00000000.0000000')
  expect(press(accepted, '1')).toMatchObject({
    text: '-00000000.0000000',
    error: { kind: 'digits', limit: 15 },
  })
})

test('accepts the 40th operand and rejects the 41st', () => {
  const prefix = '1+'.repeat(39)
  const accepted = press({ text: prefix }, '2')
  expect(accepted.text).toBe(`${prefix}2`)
  const next = press(accepted, '+')
  expect(press(next, '3')).toMatchObject({
    text: `${prefix}2+`,
    error: { kind: 'operands', limit: 40 },
  })
})

test('allows 32 open groups and counts depth again after a group closes', () => {
  const accepted = press({ text: '('.repeat(31) }, '()')
  expect(accepted.text).toBe('('.repeat(32))
  expect(press(accepted, '()')).toMatchObject({
    text: '('.repeat(32),
    error: { kind: 'nesting', limit: 32 },
  })
  const closed = `${'('.repeat(32)}1${')'.repeat(32)}+`
  expect(press({ text: closed }, '()').text).toBe(`${closed}(`)
})

test('clears validation feedback when the expression is edited or cleared', () => {
  const blocked = press({ text: '123456789012345' }, '6')
  const corrected = press(blocked, 'Backspace')
  expect(corrected.text).toBe('12345678901234')
  expect(corrected.error).toBeUndefined()
  const cleared = press(blocked, 'AC')
  expect(visibleExpression(cleared)).toBe('')
  expect(cleared.error).toBeUndefined()
  expect(calculationInput(cleared)).toBeUndefined()
})

const previous = { expression: '1/3', result: '0.333333333333333' }

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

test('deleting the continuation operator exposes the original group', () => {
  const continued = press(press(resultDraft(previous), '*'), '3')
  const draft = press(continued, 'Backspace', 17, 18)
  expect(visibleExpression(draft)).toBe('(1/3)3')
  expect(draft.caret).toBe(5)
})

test('keeps the previous result when continuing would exceed the operand limit', () => {
  const result = resultDraft({
    expression: `${'1+'.repeat(39)}1`,
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
