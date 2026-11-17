import React, { useEffect } from 'react'
import type { FieldValues, FormState, UseFormRegister, UseFormSetValue } from 'react-hook-form'

interface ControlProps {
  name: string
  storedData?: Record<string, unknown>
  label: string
  required?: boolean
  register: UseFormRegister<FieldValues>
  placeholder?: string
  formState: FormState<FieldValues>
  setValue: UseFormSetValue<FieldValues>
}

function Control({ name, storedData, label, required, register, placeholder, formState, setValue }: ControlProps) {
  const error = formState.errors[name]
  const id = `form-${name}`
  useEffect(() => {
    if (storedData && storedData[name] !== undefined) setValue(name, storedData[name])
  }, [storedData, setValue, name])
  return <div className="mb-5">
    <label className="field-label" htmlFor={id}>{label}{required && ' *'}</label>
    <input className="field-input" id={id} type="text" placeholder={placeholder} {...register(name, { required })}
      aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
    {error && <p className="mt-2 text-sm text-red-700" id={`${id}-error`}>Please provide a valid {label}.</p>}
  </div>
}

export default Control
