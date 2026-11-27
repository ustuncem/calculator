import { ShadowBox } from '@common/components/atoms/shadow-box/ShadowBox'

import type { CalculatorKey } from '../utils/calculatorInput'
import Divider from './atoms/Divider'
import KeypadButton from './atoms/KeypadButton'

const dividerClassName = 'col-span-4 mx-1'

type CalculatorKeypadProps = {
  disabled: boolean
  onKeyPress: (key: CalculatorKey) => void
}

export default function CalculatorKeypad({
  onKeyPress,
  disabled,
}: CalculatorKeypadProps) {
  return (
    <ShadowBox
      render={
        <fieldset role="region" aria-label="Number pad" disabled={disabled} />
      }
      className="grid grid-cols-4 grid-rows-[repeat(4,minmax(44px,1fr)_auto)_minmax(44px,1fr)] p-3 select-none"
    >
      <KeypadButton
        variant="secondary"
        label="All clear"
        onPress={() => onKeyPress('AC')}
      >
        AC
      </KeypadButton>
      <KeypadButton
        variant="secondary"
        label="Parentheses"
        onPress={() => onKeyPress('()')}
      >
        ()
      </KeypadButton>
      <KeypadButton
        variant="arithmetic"
        label="Percent"
        onPress={() => onKeyPress('%')}
      >
        %
      </KeypadButton>
      <KeypadButton
        variant="arithmetic"
        label="Divide"
        onPress={() => onKeyPress('/')}
      >
        ÷
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton onPress={() => onKeyPress('7')}>7</KeypadButton>
      <KeypadButton onPress={() => onKeyPress('8')}>8</KeypadButton>
      <KeypadButton onPress={() => onKeyPress('9')}>9</KeypadButton>
      <KeypadButton
        variant="arithmetic"
        label="Multiply"
        onPress={() => onKeyPress('*')}
      >
        ×
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton onPress={() => onKeyPress('4')}>4</KeypadButton>
      <KeypadButton onPress={() => onKeyPress('5')}>5</KeypadButton>
      <KeypadButton onPress={() => onKeyPress('6')}>6</KeypadButton>
      <KeypadButton
        variant="arithmetic"
        label="Subtract"
        onPress={() => onKeyPress('-')}
      >
        −
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton onPress={() => onKeyPress('1')}>1</KeypadButton>
      <KeypadButton onPress={() => onKeyPress('2')}>2</KeypadButton>
      <KeypadButton onPress={() => onKeyPress('3')}>3</KeypadButton>
      <KeypadButton
        variant="arithmetic"
        label="Add"
        onPress={() => onKeyPress('+')}
      >
        +
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton label="Change sign" onPress={() => onKeyPress('±')}>
        ±
      </KeypadButton>
      <KeypadButton onPress={() => onKeyPress('0')}>0</KeypadButton>
      <KeypadButton label="Decimal point" onPress={() => onKeyPress('.')}>
        .
      </KeypadButton>
      <KeypadButton
        variant="arithmetic"
        label="Equals"
        onPress={() => onKeyPress('=')}
      >
        =
      </KeypadButton>
    </ShadowBox>
  )
}
