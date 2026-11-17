import React, { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Dialog from './Dialog'

const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')
beforeEach(() => {
  // jsdom has no browser top layer; browser keyboard behavior is also checked with Playwright.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false } })
})
afterEach(() => {
  cleanup()
  for (const [name, descriptor] of [['showModal', originalShowModal], ['close', originalClose]] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor)
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name)
  }
})

function DialogExample() {
  const [open, setOpen] = useState(false)
  return <><button onClick={() => setOpen(true)}>Open confirmation</button>
    <Dialog open={open} title="Confirm deletion" onClose={() => setOpen(false)}><button onClick={() => setOpen(false)}>Cancel</button></Dialog>
  </>
}

test('Escape dismissal restores focus to the control that opened the dialog', () => {
  render(<DialogExample />)
  const trigger = screen.getByRole('button', { name: 'Open confirmation' })
  trigger.focus()
  fireEvent.click(trigger)
  const dialog = screen.getByRole('dialog', { name: 'Confirm deletion' })
  fireEvent(dialog, new Event('cancel', { cancelable: true }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

test('a pending destructive operation cannot be dismissed with Escape', () => {
  const onClose = vi.fn()
  render(<Dialog open title="Deleting item" onClose={onClose} busy><p>Working…</p></Dialog>)
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled()
})
