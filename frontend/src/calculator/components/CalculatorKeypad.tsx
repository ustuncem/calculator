import { ShadowBox } from '@common/components/atoms/shadow-box/ShadowBox'

import Divider from './atoms/Divider'
import KeypadButton from './atoms/KeypadButton'

const dividerClassName = 'col-span-4 mx-1'

export default function CalculatorKeypad() {
  return (
    <ShadowBox
      render={<section aria-label="Number pad" />}
      className="grid grid-cols-4 grid-rows-[repeat(4,minmax(44px,1fr)_auto)_minmax(44px,1fr)] p-3"
    >
      <KeypadButton variant="secondary" label="All clear">
        AC
      </KeypadButton>
      <KeypadButton variant="secondary" label="Parentheses">
        ()
      </KeypadButton>
      <KeypadButton variant="arithmetic" label="Percent">
        %
      </KeypadButton>
      <KeypadButton variant="arithmetic" label="Divide">
        ÷
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton>7</KeypadButton>
      <KeypadButton>8</KeypadButton>
      <KeypadButton>9</KeypadButton>
      <KeypadButton variant="arithmetic" label="Multiply">
        ×
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton>4</KeypadButton>
      <KeypadButton>5</KeypadButton>
      <KeypadButton>6</KeypadButton>
      <KeypadButton variant="arithmetic" label="Subtract">
        −
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton>1</KeypadButton>
      <KeypadButton>2</KeypadButton>
      <KeypadButton>3</KeypadButton>
      <KeypadButton variant="arithmetic" label="Add">
        +
      </KeypadButton>
      <Divider aria-hidden className={dividerClassName} />
      <KeypadButton label="Change sign">±</KeypadButton>
      <KeypadButton>0</KeypadButton>
      <KeypadButton label="Decimal point">.</KeypadButton>
      <KeypadButton variant="arithmetic" label="Equals">
        =
      </KeypadButton>
    </ShadowBox>
  )
}
