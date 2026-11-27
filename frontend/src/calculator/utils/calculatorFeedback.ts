export type Span = { start: number; end: number }

export type CalculatorError =
  | { kind: 'digits' | 'operands' | 'nesting'; limit: number }
  | { kind: 'request'; detail: string; code?: string; span?: Span }
  | { kind: 'unavailable' | 'invalid-response' }

export function errorMessage(error: CalculatorError): string {
  switch (error.kind) {
    case 'digits':
      return `Use at most ${error.limit} digits per number.`
    case 'operands':
      return `Use at most ${error.limit} numbers per expression.`
    case 'nesting':
      return `Use at most ${error.limit} nested groups.`
    case 'request':
      return error.detail
    case 'unavailable':
      return 'Could not reach the calculator. Try again.'
    case 'invalid-response':
      return 'The calculator returned an invalid result.'
  }
}
