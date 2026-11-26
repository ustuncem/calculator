import logo from '@common/assets/logo.svg'
import { Text } from '@common/components/atoms/text'

export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logo} alt="Calculator logo" />
      <Text
        aria-hidden="true"
        className="text-2xl leading-[normal] font-medium text-primary motion-safe:transition-colors motion-safe:duration-200"
      >
        calculator
      </Text>
    </div>
  )
}
