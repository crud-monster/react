import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'success'
  size?: 'sm' | 'lg'
}

const colors = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  warning: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
  outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
}

function Button({ variant = 'primary', size, type = 'button', className = '', ...props }: ButtonProps) {
  return <button type={type} className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${colors[variant]} ${className}`} {...props} />
}

export default Button
