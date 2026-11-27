import Layout from '@common/components/templates/layout/Layout'

import DisplayExpression from './components/atoms/DisplayExpression'
import CalculatorDisplay from './components/CalculatorDisplay'
import CalculatorKeypad from './components/CalculatorKeypad'
import { useCalculatorView } from './hooks/useCalculatorView'

export default function Calculator() {
  const { displayProps, expressionProps, keypadProps } = useCalculatorView()

  return (
    <Layout>
      <div className="grid grid-rows-[minmax(min-content,11fr)_minmax(min-content,17fr)] gap-4">
        <CalculatorDisplay {...displayProps}>
          <DisplayExpression {...expressionProps} />
        </CalculatorDisplay>
        <CalculatorKeypad {...keypadProps} />
      </div>
    </Layout>
  )
}
