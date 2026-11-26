import Layout from '@common/components/templates/layout/Layout'

import CalculatorDisplay from './components/CalculatorDisplay'
import { useCalculator } from './hooks/useCalculator'

export default function Calculator() {
  const { expression, backspace } = useCalculator()

  return (
    <Layout>
      <div className="grid grid-rows-[minmax(min-content,2fr)_3fr] gap-4">
        <CalculatorDisplay expression={expression} onBackspace={backspace} />
      </div>
    </Layout>
  )
}
