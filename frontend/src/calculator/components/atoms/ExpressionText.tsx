import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'

import type { Span } from '../../utils/calculatorFeedback'

const collapsedCharacter = {
  display: 'inline-block',
  width: 0,
  opacity: 0,
  y: 8,
  filter: 'blur(2px)',
}

export default function ExpressionText({
  value,
  highlight,
}: {
  value: string
  highlight?: Span
}) {
  const reduceMotion = useReducedMotion()

  return (
    <span aria-hidden="true" className="block min-h-[1lh]">
      {highlight ? (
        <>
          {value.slice(0, highlight.start)}
          <mark className="border-l-2 border-rose-600 bg-transparent -ml-0.5 text-rose-600">
            {value.slice(highlight.start, highlight.end)}
          </mark>
          {value.slice(highlight.end)}
        </>
      ) : reduceMotion ? (
        value || '0'
      ) : (
        <>
          <AnimatePresence initial={false}>
            {Array.from(value, (text, index) => (
              <m.span
                key={index}
                initial={collapsedCharacter}
                animate={{
                  display: 'inline-block',
                  width: 'auto',
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transitionEnd: { display: 'inline' },
                }}
                exit={collapsedCharacter}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                {text}
              </m.span>
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
  )
}
