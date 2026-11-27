import { useRef } from 'react'

import Layout from '@common/components/templates/layout/Layout'

import DisplayExpression from './components/atoms/DisplayExpression'
import BlackHole from './components/BlackHole'
import CalculatorDisplay from './components/CalculatorDisplay'
import CalculatorKeypad from './components/CalculatorKeypad'
import { useCalculatorView } from './hooks/useCalculatorView'

export default function Calculator() {
  const page = useRef<HTMLDivElement>(null)
  const {
    blackHoleOpen,
    dismissBlackHole,
    displayProps,
    expressionProps,
    keypadProps,
    onButtonMouseDown,
  } = useCalculatorView()

  return (
    <>
      <Layout ref={page}>
        <div
          onMouseDownCapture={onButtonMouseDown}
          className="grid grid-rows-[minmax(min-content,11fr)_minmax(min-content,17fr)] gap-4 short-landscape:grid-cols-2 short-landscape:grid-rows-1"
        >
          <CalculatorDisplay {...displayProps}>
            <DisplayExpression {...expressionProps} />
          </CalculatorDisplay>
          <CalculatorKeypad {...keypadProps} />
        </div>
      </Layout>
      {blackHoleOpen && <BlackHole page={page} onDismiss={dismissBlackHole} />}
    </>
  )
}
