import { useState } from 'react'

import { Button } from '@common/components/ui/button'

export default function Calculator() {
  const [count, setCount] = useState(0)

  return (
    <main className="grid min-h-svh place-items-center px-6">
      <section className="w-full max-w-sm rounded-3xl bg-card p-8 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold">Calculator starter</h1>
        <output
          aria-label="Counter"
          className="my-8 block text-right text-6xl tabular-nums"
        >
          {count}
        </output>
        <Button
          type="button"
          className="h-auto w-full cursor-pointer rounded-xl p-3 text-base font-semibold"
          onClick={() => setCount((value) => value + 1)}
        >
          Add 1
        </Button>
      </section>
    </main>
  )
}
