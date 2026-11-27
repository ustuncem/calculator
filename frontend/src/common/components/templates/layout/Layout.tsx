import type { ReactNode, Ref } from 'react'

import Header from '../../organisms/Header'

import './Layout.css'

export default function Layout({
  children,
  ref,
}: {
  children: ReactNode
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      className="app-layout grid h-dvh min-h-min bg-background p-5 motion-safe:transition-colors motion-safe:duration-200"
    >
      <div className="mx-auto grid w-full min-w-0 max-w-sm grid-rows-[auto_1fr] gap-4 short-landscape:max-w-3xl">
        <Header />
        <main className="grid min-w-0">{children}</main>
      </div>
    </div>
  )
}
