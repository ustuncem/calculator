import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { domAnimation, LazyMotion } from 'motion/react'
import type { ReactNode } from 'react'

import { Toaster } from '@common/components/atoms/toast'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <Toaster>{children}</Toaster>
      </LazyMotion>
    </QueryClientProvider>
  )
}
