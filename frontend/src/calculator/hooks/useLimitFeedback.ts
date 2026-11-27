import { useRef } from 'react'

import { toast } from '@common/lib/toast'

import type { LimitError } from '../utils/calculatorInput'

const shake = [0, -1, 2, -4, 4, -4, 4, -4, 2, -1, 0].map(
  (x) => `translateX(${x}px)`,
)
const errorColor = 'var(--expression-error-color)'

export function useLimitFeedback(
  limitError: LimitError | undefined,
  reduceMotion: boolean | null,
) {
  const feedback = useRef<{ error: LimitError; animation: Animation } | null>(
    null,
  )

  return function showLimitFeedback(element: HTMLDivElement | null) {
    if (!element || limitError === feedback.current?.error) return

    feedback.current?.animation.cancel()
    feedback.current = null
    if (!limitError) return

    const animation = element.animate(
      {
        color: [errorColor, errorColor],
        transform: reduceMotion ? undefined : shake,
      },
      {
        duration: reduceMotion ? 800 : 400,
        easing: 'cubic-bezier(.36,.07,.19,.97)',
      },
    )
    feedback.current = { error: limitError, animation }
    toast.add({
      id: 'calculator-input-limit',
      title: limitError.message,
      type: 'error',
      timeout: 4000,
    })
  }
}
