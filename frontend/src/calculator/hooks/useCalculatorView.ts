import { useId, useMemo, useRef } from 'react'

import { errorMessage } from '../utils/calculatorFeedback'
import { type CalculatorKey, visibleExpression } from '../utils/calculatorInput'
import {
  displaySpan,
  formatExpression,
  rawSpan,
} from '../utils/formatExpression'
import { useCalculator } from './useCalculator'
import { useCalculatorKeyboard } from './useCalculatorKeyboard'

export function useCalculatorView() {
  const calculator = useCalculator()
  const entry = useRef<HTMLTextAreaElement>(null)
  const feedbackId = useId()
  const { draft, isPending, lastCalculation } = calculator
  const expression = visibleExpression(draft)
  const value = formatExpression(expression)
  const cursor = draft.caret ?? expression.length
  const caret = displaySpan(value, { start: cursor, end: cursor }).start
  const { error } = draft
  const feedback = useMemo(() => {
    if (!error) return
    const span = error.kind === 'request' ? error.span : undefined
    return {
      id: feedbackId,
      message: errorMessage(error),
      highlight: span && displaySpan(value, span),
    }
  }, [error, feedbackId, value])

  function pressKey(key: CalculatorKey) {
    const { selectionStart, selectionEnd } = entry.current ?? {}
    calculator.pressKey(
      key,
      rawSpan(value, {
        start: selectionStart ?? caret,
        end: selectionEnd ?? caret,
      }),
    )
  }

  useCalculatorKeyboard(pressKey)

  return {
    displayProps: {
      pending: isPending,
      feedback,
      lastExpression:
        lastCalculation && formatExpression(lastCalculation.label),
      onRestore: calculator.restore,
      onBackspace: value ? () => pressKey('Backspace') : undefined,
    },
    expressionProps: {
      value,
      caret,
      inputRef: entry,
      highlight: feedback?.highlight,
      errorId: feedback?.id,
    },
    keypadProps: { disabled: isPending, onKeyPress: pressKey },
  }
}
