import { expect, test } from 'vitest'

import { formatExpression } from '../formatExpression'

test('formats thousands and arithmetic operators for display', () => {
  expect(formatExpression('-1234.50*2')).toBe('−1,234.50 × 2')
})
