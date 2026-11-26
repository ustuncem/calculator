import { useState } from 'react'

export function useCalculator() {
  const [expression, setExpression] = useState(
    '456,234.34 - 56,324 * 456 * (343 / 4)',
  )

  function backspace() {
    setExpression((value) => value.trimEnd().slice(0, -1).trimEnd())
  }

  return { expression, backspace }
}
