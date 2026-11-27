import { type KeyboardEvent, type RefObject, useLayoutEffect } from 'react'

import type { Span } from '../../utils/calculatorFeedback'
import ExpressionText from './ExpressionText'

type DisplayExpressionProps = {
  value: string
  inputRef: RefObject<HTMLInputElement | null>
  caret: number
  highlight?: Span
  errorId?: string
}

export default function DisplayExpression({
  value,
  inputRef,
  caret,
  highlight,
  errorId,
}: DisplayExpressionProps) {
  const start = highlight?.start ?? caret
  const end = highlight?.end ?? caret
  useLayoutEffect(() => {
    inputRef.current?.setSelectionRange(start, end)
  }, [value, start, end, inputRef])

  function handleCaretKey(event: KeyboardEvent<HTMLInputElement>) {
    const { key, shiftKey, metaKey, ctrlKey, currentTarget } = event

    if (key === 'Home' || key === 'End') {
      event.preventDefault()
      if (!shiftKey) {
        const position = key === 'Home' ? 0 : value.length
        currentTarget.setSelectionRange(position, position)
      }
      return
    }

    if (
      (shiftKey && (key.startsWith('Arrow') || key.startsWith('Page'))) ||
      ((metaKey || ctrlKey) && key.toLowerCase() === 'a')
    ) {
      event.preventDefault()
    }
  }

  return (
    <div className="group relative min-h-[1lh] text-right text-2xl leading-[normal] font-medium tracking-[-0.04em] text-secondary-600 dark:text-primary-400">
      <input
        ref={inputRef}
        aria-invalid={Boolean(errorId)}
        aria-describedby={errorId}
        aria-label="Expression"
        className="absolute inset-x-0 bottom-0 w-full rounded-sm text-right opacity-0 placeholder:text-current focus:opacity-100 data-highlight:focus:opacity-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
        data-highlight={highlight ? '' : undefined}
        value={value}
        placeholder="0"
        readOnly
        onKeyDown={handleCaretKey}
      />
      <span role="status" className="sr-only">
        {value || '0'}
      </span>
      <ExpressionText value={value} highlight={highlight} />
    </div>
  )
}
