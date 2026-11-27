import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react'

import type { Span } from '../utils/calculatorFeedback'

export function useExpressionMirror(
  inputRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  caret: number,
  highlight?: Span,
) {
  const start = highlight?.start ?? caret
  const end = highlight?.end ?? caret
  const mirrorRef = useRef<HTMLDivElement>(null)

  const syncScroll = useCallback(() => {
    const input = inputRef.current
    const mirror = mirrorRef.current
    if (!input || !mirror) return
    mirror.scrollTop = input.scrollTop
  }, [inputRef])

  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.setSelectionRange(start, end)
    const mark = mirrorRef.current?.querySelector('mark')
    if (mark) {
      input.scrollTop =
        mark.offsetTop - (input.clientHeight - mark.offsetHeight) / 2
    } else if (end === value.length) {
      input.scrollTop = input.scrollHeight
    }
    syncScroll()
  }, [value, start, end, inputRef, syncScroll])

  useLayoutEffect(() => {
    const input = inputRef.current
    const content = mirrorRef.current?.firstElementChild
    if (!input || !content) return
    const observer = new ResizeObserver(() => {
      if (input.selectionEnd === input.value.length)
        input.scrollTop = input.scrollHeight
      syncScroll()
    })
    observer.observe(input)
    observer.observe(content)
    return () => observer.disconnect()
  }, [inputRef, syncScroll])

  return { mirrorRef, syncScroll }
}
