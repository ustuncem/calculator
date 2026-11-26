import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@common/utils/cn'

export default function Divider({
  className,
  ...props
}: ComponentPropsWithoutRef<'hr'>) {
  return <hr className={cn('border-t border-border', className)} {...props} />
}
