import React from 'react'
import type { IPasswordStrongResult } from '../../../app/utils'
import Field from '../../../components/ui/Field'

interface PasswordComponentProps {
  strongPassword: IPasswordStrongResult
  password: string
  onPasswordChange: React.ChangeEventHandler<HTMLInputElement>
}

function PasswordComponent({ onPasswordChange, password, strongPassword }: PasswordComponentProps) {
  return <Field id="password" label="Password" help="Use at least 15 characters, or at least 8 including a number and a lowercase letter.">
    <input className="field-input" id="password" type="password" autoComplete="new-password" required value={password} onChange={onPasswordChange}
      aria-invalid={password.length > 0 && !strongPassword.valid} aria-describedby="password-help password-strength" />
    <progress className="mt-3 h-2 w-full accent-indigo-600" max={100} value={strongPassword.strong} aria-label="Password strength" />
    <span className="field-help" id="password-strength">{strongPassword.name || 'Enter a password'}</span>
  </Field>
}

export default PasswordComponent
