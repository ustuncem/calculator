import { Button } from '@base-ui/react/button'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import type { ComponentPropsWithoutRef, MouseEventHandler } from 'react'

import { cn } from '@common/utils/cn'

type AnimatedButtonProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'onClick'
> & {
  onPress: MouseEventHandler<HTMLButtonElement>
}

export function AnimatedButton({
  onPress,
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <Button
      type="button"
      {...props}
      disabled={disabled}
      onClick={onPress}
      render={
        <m.button
          whileTap={disabled || reduceMotion ? undefined : { scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      }
      className={cn(
        'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary disabled:cursor-default',
        className,
      )}
    />
  )
}
