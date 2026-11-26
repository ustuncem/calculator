import Layout from '@common/components/templates/layout/Layout'

import CalculatorDisplay from './components/CalculatorDisplay'
import CalculatorKeypad from './components/CalculatorKeypad'
import { useCalculator } from './hooks/useCalculator'

export default function Calculator() {
  const { expression, backspace } = useCalculator()

  return (
    <Layout>
      <div className="grid grid-rows-[minmax(min-content,11fr)_minmax(min-content,17fr)] gap-4">
        <CalculatorDisplay expression={expression} onBackspace={backspace} />
        <CalculatorKeypad />
      </div>
    </Layout>
  )
}
