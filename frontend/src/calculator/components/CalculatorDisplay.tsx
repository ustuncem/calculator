import { ShadowBox } from '@common/components/atoms/shadow-box/ShadowBox'

import type { LimitError } from '../utils/calculatorInput'
import BackspaceButton from './atoms/BackspaceButton'
import DisplayExpression from './atoms/DisplayExpression'
import Divider from './atoms/Divider'

type CalculatorDisplayProps = {
  expression: string
  limitError?: LimitError
  onBackspace: () => void
}

export default function CalculatorDisplay({
  expression,
  limitError,
  onBackspace,
}: CalculatorDisplayProps) {
  return (
    <ShadowBox
      render={<section aria-label="Calculator display" />}
      className="flex min-w-0 flex-col justify-end gap-4 p-3"
    >
      <DisplayExpression value={expression} limitError={limitError} />
      <Divider className="w-full" />
      <BackspaceButton disabled={!expression} onPress={onBackspace} />
    </ShadowBox>
  )
}
