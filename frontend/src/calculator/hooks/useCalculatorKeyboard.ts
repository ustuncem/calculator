import { useEffect, useEffectEvent } from 'react'

import {
  type CalculatorKey,
  getKeyboardCalculatorKey,
} from '../utils/calculatorInput'

export function useCalculatorKeyboard(
  onKey: (key: CalculatorKey, fromButton: boolean) => void,
) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.metaKey) return
    if (
      !event.getModifierState('AltGraph') &&
      (event.ctrlKey || (event.altKey && event.key !== '±'))
    )
      return

    const fromButton = event.target instanceof HTMLButtonElement
    if (fromButton && event.key === 'Enter') return
    const key = getKeyboardCalculatorKey(event.key)
    if (!key) return

    event.preventDefault()
    onKey(key, fromButton)
  })

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
