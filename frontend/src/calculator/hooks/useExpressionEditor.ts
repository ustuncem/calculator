import {
  type ChangeEvent,
  type FocusEvent,
  type InputEvent,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
} from 'react'

import type { Span } from '../utils/calculatorFeedback'
import {
  displaySpan,
  formatExpression,
  rawSpan,
} from '../utils/formatExpression'
import { useExpressionMirror } from './useExpressionMirror'

function usesTouchPointer() {
  return window.matchMedia('(pointer: coarse)').matches
}

function moveCaretToEdge(input: HTMLTextAreaElement, edge: 'Home' | 'End') {
  const position = edge === 'End' ? input.value.length : 0
  input.setSelectionRange(position, position)
  input.scrollTop = edge === 'End' ? input.scrollHeight : 0
}

function handleCaretKey(event: KeyboardEvent<HTMLTextAreaElement>) {
  const { key, shiftKey, metaKey, ctrlKey, currentTarget } = event

  if (key === 'Home' || key === 'End') {
    event.preventDefault()
    if (!shiftKey) moveCaretToEdge(currentTarget, key)
    return
  }

  if (
    (shiftKey && (key.startsWith('Arrow') || key.startsWith('Page'))) ||
    ((metaKey || ctrlKey) && key.toLowerCase() === 'a')
  ) {
    event.preventDefault()
  }
}

function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
  if (!usesTouchPointer()) moveCaretToEdge(event.currentTarget, 'End')
}

export function useExpressionEditor(
  expression: string,
  cursor = expression.length,
  errorSpan?: Span,
) {
  const input = useRef<HTMLTextAreaElement>(null)
  const value = formatExpression(expression)
  const caret = displaySpan(value, { start: cursor, end: cursor }).start
  const highlight = errorSpan && displaySpan(value, errorSpan)
  const { mirrorRef, syncScroll } = useExpressionMirror(
    input,
    value,
    caret,
    highlight,
  )

  function readSelection(): Span {
    if (!input.current) return { start: cursor, end: cursor }
    return rawSpan(value, {
      start: input.current.selectionStart,
      end: input.current.selectionEnd,
    })
  }

  function handleButtonMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      !(event.target instanceof Element) ||
      !event.target.closest('button:enabled')
    )
      return

    // Keep the native selection intact until the button's click edits it.
    event.preventDefault()
    if (usesTouchPointer()) {
      input.current?.focus({ preventScroll: true })
    } else if (
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== input.current
    ) {
      document.activeElement.blur()
    }
  }

  return {
    readSelection,
    onButtonMouseDown: handleButtonMouseDown,
    expressionProps: {
      value,
      highlight,
      mirrorRef,
      fieldProps: {
        ref: input,
        onKeyDown: handleCaretKey,
        onBlur: handleBlur,
        onScroll: syncScroll,
        // Calculator keys own edits. The editable surface supplies the native caret.
        onBeforeInput: (event: InputEvent<HTMLTextAreaElement>) =>
          event.preventDefault(),
        onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
          event.currentTarget.value = value
        },
      },
    },
  }
}
