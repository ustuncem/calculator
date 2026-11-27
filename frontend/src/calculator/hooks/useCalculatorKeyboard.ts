import { useEffect, useEffectEvent } from 'react'

import {
  type CalculatorKey,
  getKeyboardCalculatorKey,
} from '../utils/calculatorInput'

export function useCalculatorKeyboard(onKey: (key: CalculatorKey) => void) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.metaKey) return
    if (
      !event.getModifierState('AltGraph') &&
      (event.ctrlKey || (event.altKey && event.key !== '±'))
    )
      return

    if (event.key === 'Enter' && event.target instanceof HTMLButtonElement)
      return
    const key = getKeyboardCalculatorKey(event.key)
    if (!key) return

    event.preventDefault()
    onKey(key)
  })

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
