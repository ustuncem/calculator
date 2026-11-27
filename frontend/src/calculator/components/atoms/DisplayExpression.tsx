import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'

import { Text } from '@common/components/atoms/text'

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

  return (
    <Text
      as="output"
      aria-label="Expression"
      className="relative min-h-[1lh] text-right text-2xl leading-[normal] font-medium wrap-anywhere text-secondary-600 dark:text-primary-400"
    >
      {reduceMotion ? (
        value || '0'
      ) : (
        <>
          <span className="sr-only">{value || '0'}</span>
          <span aria-hidden="true">
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
          </span>
        </>
      )}
    </Text>
  )
}
