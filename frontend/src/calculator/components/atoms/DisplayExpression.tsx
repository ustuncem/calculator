import type { useExpressionEditor } from '../../hooks/useExpressionEditor'
import ExpressionText from './ExpressionText'

import './DisplayExpression.css'

type DisplayExpressionProps = ReturnType<
  typeof useExpressionEditor
>['expressionProps'] & {
  errorId?: string
}

export default function DisplayExpression({
  value,
  highlight,
  mirrorRef,
  fieldProps,
  errorId,
}: DisplayExpressionProps) {
  return (
    <div className="expression-editor relative isolate grid min-h-[1lh] grid-rows-[minmax(0,1fr)] rounded-sm text-right text-2xl leading-[normal] font-medium tracking-[-0.04em] text-secondary-600 group-aria-busy:pointer-events-none group-aria-busy:opacity-0 dark:text-primary-400">
      <textarea
        {...fieldProps}
        aria-invalid={Boolean(errorId)}
        aria-describedby={errorId}
        aria-label="Expression"
        className="absolute inset-0 size-full resize-none appearance-none overflow-y-auto overscroll-contain bg-transparent p-0 text-right text-transparent caret-secondary-600 outline-none [scrollbar-width:none] focus-visible:outline-hidden dark:caret-primary-400"
        value={value}
        rows={1}
        inputMode="none"
        spellCheck={false}
      />
      <span role="status" className="sr-only">
        {value || '0'}
      </span>
      <div
        ref={mirrorRef}
        className="pointer-events-none relative overflow-hidden select-none"
      >
        <ExpressionText value={value} highlight={highlight} />
      </div>
    </div>
  )
}
