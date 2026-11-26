import { ShadowBox } from '@common/components/atoms/shadow-box/ShadowBox'

import BackspaceButton from './atoms/BackspaceButton'
import DisplayExpression from './atoms/DisplayExpression'
import Divider from './atoms/Divider'

type CalculatorDisplayProps = {
  expression: string
  onBackspace: () => void
}

export default function CalculatorDisplay({
  expression,
  onBackspace,
}: CalculatorDisplayProps) {
  return (
    <ShadowBox
      render={<section aria-label="Calculator display" />}
      className="flex min-w-0 flex-col justify-end gap-4 p-3"
    >
      <DisplayExpression value={expression} />
      <Divider className="w-full" />
      <BackspaceButton disabled={!expression} onPress={onBackspace} />
    </ShadowBox>
  )
}
