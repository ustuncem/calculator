import type { MouseEvent } from 'react'

import Layout from '@common/components/templates/layout/Layout'

import DisplayExpression from './components/atoms/DisplayExpression'
import CalculatorDisplay from './components/CalculatorDisplay'
import CalculatorKeypad from './components/CalculatorKeypad'
import { useCalculatorView } from './hooks/useCalculatorView'

export default function Calculator() {
  const { displayProps, expressionProps, keypadProps } = useCalculatorView()

  function releasePointerFocus(event: MouseEvent<HTMLDivElement>) {
    if (event.detail > 0 && event.target instanceof Element) {
      event.target.closest('button')?.blur()
    }
  }

  return (
    <Layout>
      <div
        data-calculator
        onClickCapture={releasePointerFocus}
        className="grid grid-rows-[minmax(min-content,11fr)_minmax(min-content,17fr)] gap-4"
      >
        <CalculatorDisplay {...displayProps}>
          <DisplayExpression {...expressionProps} />
        </CalculatorDisplay>
        <CalculatorKeypad {...keypadProps} />
      </div>
    </Layout>
  )
}
