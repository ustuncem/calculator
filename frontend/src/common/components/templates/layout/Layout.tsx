import type { ReactNode } from 'react'

import Header from '../../organisms/Header'

import './Layout.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout grid min-h-dvh bg-background p-5 motion-safe:transition-colors motion-safe:duration-200">
      <div className="mx-auto grid w-full min-w-0 max-w-sm grid-rows-[auto_1fr] gap-4">
        <Header />
        <main className="grid min-w-0">{children}</main>
      </div>
    </div>
  )
}
