import { useId, useMemo } from 'react'

import { errorMessage } from '../utils/calculatorFeedback'
import { type CalculatorKey, visibleExpression } from '../utils/calculatorInput'
import { formatExpression } from '../utils/formatExpression'
import { useCalculator } from './useCalculator'
import { useCalculatorKeyboard } from './useCalculatorKeyboard'
import { useExpressionEditor } from './useExpressionEditor'

export function useCalculatorView() {
  const calculator = useCalculator()
  const feedbackId = useId()
  const { draft, isPending, lastCalculation } = calculator
  const { error } = draft
  const editor = useExpressionEditor(
    visibleExpression(draft),
    draft.caret,
    error?.kind === 'request' ? error.span : undefined,
  )
  const feedback = useMemo(() => {
    if (error) return { id: feedbackId, message: errorMessage(error) }
  }, [error, feedbackId])

  function pressKey(key: CalculatorKey) {
    calculator.pressKey(key, editor.readSelection())
  }

  useCalculatorKeyboard(pressKey)
  return {
    onButtonMouseDown: editor.onButtonMouseDown,
    displayProps: {
      pending: isPending,
      rounded: draft.mode === 'result' && draft.base.rounded,
      feedback,
      lastExpression:
        lastCalculation && formatExpression(lastCalculation.label),
      onRestore: calculator.restore,
      onBackspace: editor.expressionProps.value
        ? () => pressKey('Backspace')
        : undefined,
    },
    expressionProps: {
      ...editor.expressionProps,
      errorId: feedback?.id,
    },
    keypadProps: { disabled: isPending, onKeyPress: pressKey },
  }
}
