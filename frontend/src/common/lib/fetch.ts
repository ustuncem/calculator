export class HttpError extends Error {
  problem: unknown

  constructor(status: number, problem: unknown) {
    const detail =
      problem && typeof problem === 'object' && 'detail' in problem
        ? problem.detail
        : undefined
    super(
      typeof detail === 'string' && detail
        ? detail
        : `Request failed (HTTP ${status}).`,
    )
    this.problem = problem
  }
}

export async function fetch(
  path: string,
  options?: RequestInit,
): Promise<unknown> {
  const response = await globalThis.fetch(path, options)
  if (!response.ok) {
    throw new HttpError(
      response.status,
      await response.json().catch(() => null),
    )
  }
  return response.json()
}
