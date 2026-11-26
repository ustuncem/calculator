import type { ReactNode } from 'react'

import { AnimatedButton } from '@common/components/atoms/AnimatedButton'
import { Text } from '@common/components/atoms/text'
import { cn } from '@common/utils/cn'

const labelStyles = {
  default: 'text-secondary-400 dark:text-primary-500',
  arithmetic:
    'bg-gradient-purple bg-clip-text text-transparent dark:bg-gradient-orange',
  secondary: 'text-foreground',
}

type KeypadButtonProps = {
  variant?: keyof typeof labelStyles
  label?: string
  children: ReactNode
}

export default function KeypadButton({
  variant = 'default',
  label,
  children,
}: KeypadButtonProps) {
  return (
    <AnimatedButton
      aria-label={label}
      className="grid min-h-11 min-w-0 place-items-center rounded-sm text-[28px] leading-[normal]"
    >
      <Text className={cn('tracking-normal', labelStyles[variant])}>
        {children}
      </Text>
    </AnimatedButton>
  )
}
