type LastExpressionButtonProps = {
  expression: string
  disabled: boolean
  onRestore: () => void
}

export default function LastExpressionButton({
  expression,
  disabled,
  onRestore,
}: LastExpressionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onRestore}
      aria-label={`Restore result of ${expression}`}
      className="max-w-full cursor-pointer self-end truncate rounded-sm text-right text-sm text-muted-foreground hover:underline focus-visible:outline-2"
    >
      {expression}
    </button>
  )
}
