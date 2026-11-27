import { useReducer, useState } from 'react'

import {
  formatExpression,
  getKeyboardCalculatorKey,
  updateExpression,
} from '../utils/calculatorInput'

export function useCalculator() {
  const [expression, pressKey] = useReducer(updateExpression, '')

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
    pressKey,
    keyboardRef,
  }
}
