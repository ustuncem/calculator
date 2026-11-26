import { useRender } from '@base-ui/react/use-render'

import { cn } from '@common/utils/cn'

import './ShadowBox.css'

export function ShadowBox({
  render,
  className,
  ...props
}: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: { ...props, className: cn('shadow-box', className) },
  })
}
