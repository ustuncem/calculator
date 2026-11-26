import { useState } from 'react'

import { Button } from '@/components/ui/button'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="grid min-h-svh place-items-center bg-stone-100 px-6 text-stone-900">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Calculator starter</h1>
        <output
          aria-label="Counter"
          className="my-8 block text-right font-mono text-6xl tabular-nums"
        >
          {count}
        </output>
        <Button
          type="button"
          className="h-auto w-full cursor-pointer rounded-xl bg-teal-800 p-3 text-base font-semibold text-white hover:bg-teal-900"
          onClick={() => setCount((value) => value + 1)}
        >
          Add 1
        </Button>
      </section>
    </main>
  )
}
