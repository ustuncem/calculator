import { AnimatedButton } from '@common/components/atoms/AnimatedButton'

import backspace from '../../assets/backspace.svg?no-inline'

type BackspaceButtonProps = {
  disabled: boolean
  onPress?: () => void
}

export default function BackspaceButton({
  disabled,
  onPress,
}: BackspaceButtonProps) {
  return (
    <AnimatedButton
      aria-label="Backspace"
      disabled={disabled}
      onPress={onPress}
      className="mr-6 grid h-8 w-10 place-items-center self-end rounded-sm"
    >
      <span
        aria-hidden="true"
        className="size-6 bg-secondary-600 dark:bg-primary-400"
        style={{ maskImage: `url("${backspace}")` }}
      />
    </AnimatedButton>
  )
}
