export default function CalculationSkeleton() {
  return (
    <div
      role="status"
      className="h-[1lh] w-1/2 self-end rounded bg-secondary-200 text-2xl motion-safe:animate-pulse dark:bg-primary-700"
    >
      <span className="sr-only">Calculating…</span>
    </div>
  )
}
