import React, { useEffect, useId, useRef } from 'react'
import Button from './Button'

interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  busy?: boolean
  children: React.ReactNode
}

function Dialog({ open, title, onClose, busy, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    const previous = document.activeElement
    dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => {
      if (dialog.open) dialog.close()
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus()
    }
  }, [open])

  return <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy || undefined}
    tabIndex={-1}
    className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
    onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return
      const items = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      const first = items[0]
      const last = items.at(-1)
      if (!first) { event.preventDefault(); event.currentTarget.focus() }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }}
    onClick={event => {
      const bounds = event.currentTarget.getBoundingClientRect()
      const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom
      if (outside && event.target === event.currentTarget && !busy) onClose()
    }}>
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 id={titleId}>{title}</h2>
      <Button variant="secondary" aria-label="Close dialog" disabled={busy} onClick={onClose}>×</Button>
    </div>
    {children}
  </dialog>
}

export default Dialog
