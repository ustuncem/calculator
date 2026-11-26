import { type ComponentPropsWithoutRef, createElement } from 'react'

import { cn } from '@common/utils/cn'

type TextElement =
  'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'output' | 'label'

type TextProps<T extends TextElement> = { as?: T } & ComponentPropsWithoutRef<T>

export function Text<T extends TextElement = 'span'>({
  as,
  className,
  ...props
}: TextProps<T>) {
  return createElement(as ?? 'span', {
    ...props,
    className: cn('tracking-[-0.04em]', className),
  })
}
