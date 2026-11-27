import { type RefObject, useEffectEvent, useLayoutEffect, useRef } from 'react'

import './BlackHole.css'

const duration = 3000

function pullPageIn(page: HTMLElement, viewport: DOMRect) {
  const parts = page.querySelectorAll(
    'header > *, main section, fieldset, fieldset > *',
  )
  return Array.from(parts, (part) => {
    if (part instanceof HTMLFieldSetElement) {
      return part.animate(
        {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          boxShadow: 'none',
        },
        { duration: 1200, fill: 'forwards' },
      )
    }

    const { left, top, width, height } = part.getBoundingClientRect()
    const x = viewport.left + viewport.width / 2 - left
    const y = viewport.top + viewport.height / 2 - top
    const transformOrigin = `${x}px ${y}px`
    return part.animate(
      [
        { transform: 'rotate(0deg) scale(1)', opacity: 1, transformOrigin },
        { transform: 'rotate(18deg) scale(.88)', opacity: 1, transformOrigin },
        { transform: 'rotate(85deg) scale(.4)', opacity: 0.9, transformOrigin },
        { transform: 'rotate(165deg) scale(.02)', opacity: 0, transformOrigin },
      ],
      {
        delay: Math.min(Math.hypot(x - width / 2, y - height / 2) * 0.45, 240),
        duration: 1650,
        easing: 'cubic-bezier(.45, 0, .8, 1)',
        fill: 'both',
      },
    )
  })
}

export default function BlackHole({
  page,
  onDismiss,
}: {
  page: RefObject<HTMLDivElement | null>
  onDismiss: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const dismiss = useEffectEvent(onDismiss)

  useLayoutEffect(() => {
    const modal = dialog.current
    const background = page.current
    if (!modal || !background) return

    modal.style.setProperty('--black-hole-duration', `${duration}ms`)
    modal.showModal()
    const animations = window.matchMedia(
      '(prefers-reduced-motion: no-preference)',
    ).matches
      ? pullPageIn(background, modal.getBoundingClientRect())
      : []
    const timeout = window.setTimeout(() => dismiss(), duration)

    return () => {
      window.clearTimeout(timeout)
      for (const animation of animations) animation.cancel()
      modal.close()
    }
  }, [page])

  return (
    <dialog
      ref={dialog}
      aria-label="Division by zero"
      className="black-hole-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onDismiss()
      }}
    >
      <div className="black-hole" aria-hidden="true">
        <div className="black-hole-core" />
      </div>
      <button
        type="button"
        className="absolute top-5 right-5 min-h-11 cursor-pointer rounded-full border border-white/35 bg-black/75 px-4 text-sm font-medium text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </dialog>
  )
}
