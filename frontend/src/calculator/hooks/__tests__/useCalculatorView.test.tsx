// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  renderHook,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'

import type { CalculatorKey } from '../../utils/calculatorInput'
import { useCalculatorView } from '../useCalculatorView'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderCalculator() {
  const client = new QueryClient()
  const result = renderHook(useCalculatorView, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  }).result

  function press(...keys: CalculatorKey[]) {
    for (const key of keys)
      act(() => result.current.keypadProps.onKeyPress(key))
  }

  return { result, press }
}

test('handles calculator keys while letting modified shortcuts pass through', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(Response.json({ result: '16' })),
  )
  const { result } = renderCalculator()

  fireEvent.keyDown(window, { key: '8', ctrlKey: true })
  expect(result.current.expressionProps.value).toBe('')
  fireEvent.keyDown(window, { key: '8' })
  fireEvent.keyDown(window, { key: '*' })
  fireEvent.keyDown(window, { key: '2' })
  expect(result.current.expressionProps.value).toBe('8 × 2')
  fireEvent.keyDown(window, { key: 'Enter' })
  await waitFor(() => expect(result.current.expressionProps.value).toBe('16'))
})

test('submits the original expression when continuing from a rounded result', async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      Response.json({ result: '0.333333333333333', rounded: true }),
    )
    .mockResolvedValueOnce(Response.json({ result: '1', rounded: false }))
  vi.stubGlobal('fetch', request)
  const { result, press } = renderCalculator()

  press('1', '/', '3', '=')
  await waitFor(() => {
    expect(result.current.expressionProps.value).toBe('0.333333333333333')
  })
  press('*', '3', '=')
  await waitFor(() => {
    expect(result.current.expressionProps.value).toBe('1')
  })
  expect(request.mock.calls).toEqual([
    [
      '/api/v1/calculate',
      expect.objectContaining({ method: 'POST', body: '{"expression":"1/3"}' }),
    ],
    [
      '/api/v1/calculate',
      expect.objectContaining({
        method: 'POST',
        body: '{"expression":"(1/3)*3"}',
      }),
    ],
  ])
})

test('displays a large result and reuses its original expression for continuation', async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json({ result: '1E+15', rounded: false }))
    .mockResolvedValueOnce(
      Response.json({ result: '999999999999999', rounded: false }),
    )
  vi.stubGlobal('fetch', request)
  const { result, press } = renderCalculator()

  press(...Array<CalculatorKey>(15).fill('9'), '+', '1', '=')
  await waitFor(() =>
    expect(result.current.expressionProps.value).toBe('1E+15'),
  )
  press('-', '1')
  expect(result.current.expressionProps.value).toBe('1E+15 − 1')
  press('=')
  await waitFor(() => {
    expect(result.current.expressionProps.value).toBe('999,999,999,999,999')
  })
  expect(request.mock.calls[1]?.[1]?.body).toBe(
    '{"expression":"(999999999999999+1)-1"}',
  )
})

test('ignores empty submissions and key presses during a pending calculation', async () => {
  let finishRequest!: (response: Response) => void
  const pending = new Promise<Response>((resolve) => {
    finishRequest = resolve
  })
  const request = vi.fn(() => pending)
  vi.stubGlobal('fetch', request)
  const { result, press } = renderCalculator()

  press('=')
  expect(request).not.toHaveBeenCalled()
  press('2', '=')
  await waitFor(() => expect(result.current.keypadProps.disabled).toBe(true))
  press('=', 'AC', '3')
  expect(request).toHaveBeenCalledTimes(1)
  expect(result.current.expressionProps.value).toBe('2')

  await act(async () => {
    finishRequest(Response.json({ result: '2', rounded: false }))
  })
  await waitFor(() => expect(result.current.keypadProps.disabled).toBe(false))
  press('3')
  expect(result.current.expressionProps.value).toBe('3')
})

test('highlights a failed calculation and can restore the last successful result', async () => {
  const detail = 'The divisor evaluates to zero.'
  vi.stubGlobal(
    'fetch',
    vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ result: '9', rounded: false }))
      .mockResolvedValueOnce(
        Response.json({ detail, start: 1, end: 2 }, { status: 422 }),
      ),
  )
  const { result, press } = renderCalculator()

  press('8', '+', '1', '=')
  await waitFor(() => expect(result.current.expressionProps.value).toBe('9'))
  press('8', '/', '0', '=')
  await waitFor(() => {
    expect(result.current.displayProps.feedback?.message).toBe(detail)
  })
  expect(result.current.expressionProps.value).toBe('8 ÷ 0')
  expect(result.current.expressionProps.highlight).toEqual({ start: 2, end: 3 })
  expect(result.current.displayProps.lastExpression).toBe('8 + 1')

  act(() => result.current.displayProps.onRestore())
  expect(result.current.expressionProps.value).toBe('9')
  expect(result.current.displayProps.feedback).toBeUndefined()
})

test.each([
  ['reversed', 2, 1],
  ['out of bounds', 1, 3],
  ['fractional', 0.5, 1],
])('keeps the error message and ignores a %s span', async (_, start, end) => {
  const detail = 'Enter a number or parenthesized expression.'
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ detail, start, end }, { status: 422 }),
      ),
  )
  const { result, press } = renderCalculator()

  press('1', '+', '=')
  await waitFor(() => {
    expect(result.current.displayProps.feedback?.message).toBe(detail)
  })
  expect(result.current.expressionProps.highlight).toBeUndefined()
})

test.each([
  ['a numeric result', () => Response.json({ result: 0.3 })],
  ['an incomplete exponent', () => Response.json({ result: '1E+' })],
  ['malformed JSON', () => new Response('invalid JSON')],
])(
  'keeps the input and reports %s as an invalid response',
  async (_, respond) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond()))
    const { result, press } = renderCalculator()

    press('1', '=')
    await waitFor(() => {
      expect(result.current.displayProps.feedback?.message).toBe(
        'The calculator returned an invalid result.',
      )
    })
    expect(result.current.expressionProps.value).toBe('1')
  },
)

test('keeps the input available for retry when the network is unavailable', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(Response.json({ result: '4', rounded: false })),
  )
  const { result, press } = renderCalculator()

  press('2', '*', '2', '=')
  await waitFor(() => {
    expect(result.current.displayProps.feedback?.message).toBe(
      'Could not reach the calculator. Try again.',
    )
  })
  expect(result.current.expressionProps.value).toBe('2 × 2')

  press('=')
  await waitFor(() => expect(result.current.expressionProps.value).toBe('4'))
  expect(result.current.displayProps.feedback).toBeUndefined()
})
