import { expect, test } from 'vitest'

import { displaySpan, formatExpression, rawSpan } from '../formatExpression'

test('formats thousands and arithmetic operators for display', () => {
  expect(formatExpression('-1234.50*2')).toBe('−1,234.50 × 2')
})

test('formats unary signs and incomplete expressions as the user types', () => {
  expect(formatExpression('2--.5/')).toBe('2 − −.5 ÷')
  expect(formatExpression('0.01234567890123456789')).toBe(
    '0.01234567890123456789',
  )
})

test('formats the operators around a scientific result and keeps its exponent together', () => {
  expect(formatExpression('-1.25E+15+2345')).toBe('−1.25E+15 + 2,345')
})

test('maps raw error spans across display separators and preserves a trailing caret', () => {
  const formatted = '1,234 ÷ 0'
  expect(displaySpan(formatted, { start: 4, end: 5 })).toEqual({
    start: 6,
    end: 7,
  })
  expect(displaySpan(formatted, { start: 6, end: 6 })).toEqual({
    start: 9,
    end: 9,
  })
})

test('maps a display selection back to the raw characters it covers', () => {
  expect(rawSpan('1,234 ÷ 0', { start: 2, end: 7 })).toEqual({
    start: 1,
    end: 5,
  })
  expect(rawSpan('1,234 ÷ 0', { start: 1, end: 2 })).toEqual({
    start: 1,
    end: 1,
  })
})
