import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import type { KeyboardEvent } from 'react'

const collapsedCharacter = { width: 0, opacity: 0, y: 8, filter: 'blur(2px)' }

function Character({ text }: { text: string }) {
  return (
    <m.span
      className="inline-block whitespace-pre"
      initial={collapsedCharacter}
      animate={{ width: 'auto', opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={collapsedCharacter}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      {text}
    </m.span>
  )
}

export default function DisplayExpression({ value }: { value: string }) {
  const reduceMotion = useReducedMotion()

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
        aria-label="Expression"
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full rounded-sm text-right opacity-0 placeholder:text-current focus:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
        value={value}
        placeholder="0"
        readOnly
        onFocus={({ currentTarget }) => {
          currentTarget.setSelectionRange(value.length, value.length)
        }}
        onKeyDown={handleCaretKey}
      />
      <span role="status" className="sr-only">
        {value || '0'}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none block wrap-anywhere select-none group-focus-within:invisible"
      >
        {reduceMotion ? (
          value || '0'
        ) : (
          <>
            <AnimatePresence initial={false}>
              {Array.from(value, (text, index) => (
                <Character key={index} text={text} />
              ))}
            </AnimatePresence>
            {!value && (
              <span className="absolute right-0 animate-in fade-in duration-[120ms]">
                0
              </span>
            )}
          </>
        )}
      </span>
    </div>
  )
}
