export default function CalculationSkeleton() {
  return (
    <div
      role="status"
      className="absolute right-0 bottom-0 h-[1lh] w-1/2 rounded bg-secondary-200 text-2xl motion-safe:animate-pulse dark:bg-primary-700"
    >
      <span className="sr-only">Calculating…</span>
    </div>
  )
}
