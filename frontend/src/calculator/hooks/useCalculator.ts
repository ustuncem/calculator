import { useReducer, useState } from 'react'

import {
  type CalculatorKey,
  formatExpression,
  getKeyboardCalculatorKey,
  type LimitError,
  updateExpression,
} from '../utils/calculatorInput'

type CalculatorInput = { expression: string; limitError?: LimitError }

function applyKey(state: CalculatorInput, key: CalculatorKey): CalculatorInput {
  const result = updateExpression(state.expression, key)
  if (typeof result !== 'string') {
    return { expression: state.expression, limitError: result }
  }
  return result === state.expression ? state : { expression: result }
}

export function useCalculator() {
  const [{ expression, limitError }, pressKey] = useReducer(applyKey, {
    expression: '',
  })

  // Keep the ref stable so React leaves the listener attached across updates.
  const [keyboardRef] = useState(() => (element: HTMLDivElement | null) => {
    if (!element) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.metaKey) return
      if (!event.getModifierState('AltGraph')) {
        if (event.ctrlKey || (event.altKey && event.key !== '±')) return
      }
      if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) {
        return
      }

      const key = getKeyboardCalculatorKey(event.key)
      if (!key) return

      event.preventDefault()
      pressKey(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    displayExpression: formatExpression(expression),
    limitError,
    pressKey,
    keyboardRef,
  }
}
