import type { KeyboardEvent, RefObject } from 'react'

import { useExpressionMirror } from '../../hooks/useExpressionMirror'
import type { Span } from '../../utils/calculatorFeedback'
import ExpressionText from './ExpressionText'

import './DisplayExpression.css'

type DisplayExpressionProps = {
  value: string
  inputRef: RefObject<HTMLTextAreaElement | null>
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
  const { mirrorRef, syncScroll } = useExpressionMirror(
    inputRef,
    value,
    caret,
    highlight,
  )

  function handleCaretKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    const { key, shiftKey, metaKey, ctrlKey, currentTarget } = event

    if (key === 'Home' || key === 'End') {
      event.preventDefault()
      if (!shiftKey) {
        const position = key === 'Home' ? 0 : value.length
        currentTarget.setSelectionRange(position, position)
        currentTarget.scrollTop =
          key === 'Home' ? 0 : currentTarget.scrollHeight
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
    <div className="expression-editor relative isolate grid min-h-[1lh] grid-rows-[minmax(0,1fr)] rounded-sm text-right text-2xl leading-[normal] font-medium tracking-[-0.04em] text-secondary-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-primary dark:text-primary-400">
      <textarea
        ref={inputRef}
        aria-invalid={Boolean(errorId)}
        aria-describedby={errorId}
        aria-label="Expression"
        className="absolute inset-0 size-full resize-none appearance-none overflow-y-auto overscroll-contain bg-transparent p-0 text-right text-transparent caret-secondary-600 outline-none [scrollbar-width:none] dark:caret-primary-400"
        value={value}
        rows={1}
        inputMode="none"
        spellCheck={false}
        onBeforeInput={(event) => event.preventDefault()}
        // Calculator keys own edits. The editable surface supplies the native caret.
        onChange={(event) => {
          event.currentTarget.value = value
        }}
        onKeyDown={handleCaretKey}
        onScroll={syncScroll}
      />
      <span role="status" className="sr-only">
        {value || '0'}
      </span>
      <div
        ref={mirrorRef}
        className="pointer-events-none relative overflow-hidden select-none"
      >
        <ExpressionText value={value} highlight={highlight} />
      </div>
    </div>
  )
}
