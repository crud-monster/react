import React from 'react'

interface AlertProps {
  variant?: 'danger' | 'warning' | 'success' | 'dark' | 'primary'
  children: React.ReactNode
}

const colors = {
  danger: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  dark: 'border-slate-200 bg-slate-100 text-slate-800',
  primary: 'border-indigo-200 bg-indigo-50 text-indigo-900',
}

function Alert({ variant = 'primary', children }: AlertProps) {
  return <div role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'} className={`rounded-md border p-4 text-sm ${colors[variant]}`}>{children}</div>
}

export default Alert
