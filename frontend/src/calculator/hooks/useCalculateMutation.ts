import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { fetch, HttpError } from '@common/lib/fetch'

import type { CalculatorError, Span } from '../utils/calculatorFeedback'

type CalculationInput = { expression: string; label: string }
type Calculation = CalculationInput & { result: string }
const lastCalculationKey = ['calculator', 'last-success'] as const

async function calculate(input: CalculationInput): Promise<Calculation> {
  const data = await fetch('/api/v1/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression: input.expression }),
  })
  if (
    !data ||
    typeof data !== 'object' ||
    !('result' in data) ||
    typeof data.result !== 'string' ||
    !/^-?\d+(?:\.\d+)?$/.test(data.result)
  ) {
    throw new SyntaxError()
  }
  return { ...input, result: data.result }
}

function problemSpan(problem: unknown, length: number): Span | undefined {
  if (
    !problem ||
    typeof problem !== 'object' ||
    !('start' in problem) ||
    !('end' in problem)
  )
    return
  const { start, end } = problem
  if (
    typeof start === 'number' &&
    typeof end === 'number' &&
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    start <= end &&
    end <= length
  ) {
    return { start, end }
  }
}

function requestError(error: unknown, length: number): CalculatorError {
  if (error instanceof HttpError) {
    return {
      kind: 'request',
      detail: error.message,
      span: problemSpan(error.problem, length),
    }
  }
  return {
    kind: error instanceof SyntaxError ? 'invalid-response' : 'unavailable',
  }
}

export function useCalculateMutation() {
  const client = useQueryClient()
  const last = useQuery<Calculation>({
    queryKey: lastCalculationKey,
    queryFn: skipToken,
  })
  const { mutateAsync, isPending } = useMutation({
    mutationFn: calculate,
    networkMode: 'always',
    onSuccess: (calculation) =>
      client.setQueryData(lastCalculationKey, calculation),
  })

  async function submit(input: CalculationInput) {
    try {
      return { calculation: await mutateAsync(input) }
    } catch (error) {
      return { error: requestError(error, input.expression.length) }
    }
  }

  return { submit, isPending, lastCalculation: last.data }
}
