import React from 'react'

interface FieldProps {
  id: string
  label: string
  help?: string
  children: React.ReactNode
}

function Field({ id, label, help, children }: FieldProps) {
  return <div><label className="field-label" htmlFor={id}>{label}</label>{children}{help && <p className="field-help" id={`${id}-help`}>{help}</p>}</div>
}

export default Field
