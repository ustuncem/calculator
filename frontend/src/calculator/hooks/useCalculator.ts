import { useState } from 'react'

import {
  type CalculatorKey,
  formatExpression,
  updateExpression,
} from '../utils/calculatorInput'

export function useCalculator() {
  const [expression, setExpression] = useState('')

  function pressKey(key: CalculatorKey) {
    setExpression((value) => updateExpression(value, key))
  }

  return { displayExpression: formatExpression(expression), pressKey }
}
