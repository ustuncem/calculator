import { useReducedMotion } from 'motion/react'
import { type ReactNode, useCallback } from 'react'

import { ShadowBox } from '@common/components/atoms/shadow-box/ShadowBox'
import { Text } from '@common/components/atoms/text'

import BackspaceButton from './atoms/BackspaceButton'
import CalculationSkeleton from './atoms/CalculationSkeleton'
import Divider from './atoms/Divider'
import LastExpressionButton from './atoms/LastExpressionButton'

type CalculatorDisplayProps = {
  children: ReactNode
  rounded: boolean
  pending: boolean
  feedback?: { id: string; message: string }
  lastExpression?: string
  onRestore: () => void
  onBackspace?: () => void
}

export default function CalculatorDisplay({
  children,
  rounded,
  pending,
  feedback,
  lastExpression,
  onRestore,
  onBackspace,
}: CalculatorDisplayProps) {
  const reducedMotion = useReducedMotion()

  const shakeOnError = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element || !feedback || reducedMotion) return
      const animation = element.animate(
        { transform: [0, -4, 4, -4, 4, 0].map((x) => `translateX(${x}px)`) },
        { duration: 320, easing: 'ease-out' },
      )
      return () => animation.cancel()
    },
    [feedback, reducedMotion],
  )

  return (
    <ShadowBox
      render={<section aria-label="Calculator display" aria-busy={pending} />}
      className="group flex min-w-0 flex-col justify-end gap-4 p-3"
    >
      {lastExpression && (
        <LastExpressionButton
          expression={lastExpression}
          disabled={pending}
          onRestore={onRestore}
        />
      )}
      <div
        ref={shakeOnError}
        className="relative flex min-h-[1lh] flex-1 flex-col justify-end text-2xl leading-[normal] [contain:size]"
      >
        {children}
        {pending && <CalculationSkeleton />}
      </div>
      {rounded && !pending && (
        <Text
          as="p"
          role="status"
          className="text-right text-sm text-muted-foreground"
        >
          Rounded result
        </Text>
      )}
      {feedback && !pending && (
        <Text
          as="p"
          id={feedback.id}
          role="alert"
          className="text-right text-sm text-rose-600"
        >
          {feedback.message}
        </Text>
      )}
      <Divider className="w-full" />
      <BackspaceButton
        disabled={pending || !onBackspace}
        onPress={onBackspace}
      />
    </ShadowBox>
  )
}
