import { useRef, useState } from 'react'

import type { Span } from '../utils/calculatorFeedback'
import {
  calculationInput,
  type CalculatorKey,
  type Draft,
  editDraft,
  rejectCalculation,
  resultDraft,
} from '../utils/calculatorInput'
import { useCalculateMutation } from './useCalculateMutation'

export function useCalculator() {
  const [draft, setDraft] = useState<Draft>({ text: '' })
  const { submit, isPending, lastCalculation } = useCalculateMutation()
  const submitting = useRef(false)

  function calculate() {
    const input = calculationInput(draft)
    if (!input) return

    submitting.current = true
    void submit(input)
      .then((outcome) => {
        setDraft(
          outcome.calculation
            ? resultDraft(outcome.calculation)
            : rejectCalculation(draft, outcome.error),
        )
      })
      .finally(() => {
        submitting.current = false
      })
  }

  function pressKey(key: CalculatorKey, selection: Span) {
    if (submitting.current) return
    if (key === '=') {
      calculate()
    } else {
      setDraft(editDraft(draft, key, selection))
    }
  }

  function restore() {
    if (!submitting.current && lastCalculation)
      setDraft(resultDraft(lastCalculation))
  }

  return { draft, isPending, lastCalculation, pressKey, restore }
}
