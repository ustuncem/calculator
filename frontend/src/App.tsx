import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="grid min-h-svh place-items-center bg-stone-100 px-6 text-stone-900">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Calculator starter</h1>
        <output aria-label="Counter" className="my-8 block text-right font-mono text-6xl tabular-nums">
          {count}
        </output>
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-teal-800 p-3 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4"
          onClick={() => setCount(value => value + 1)}
        >
          Add 1
        </button>
      </section>
    </main>
  )
}
