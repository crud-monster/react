import React, { useState } from 'react'
import type { IFilteredField } from './RowItem'

const operators = {
  contains: 'contains', not_contains: 'does not contain', starts_with: 'starts with',
  not_starts_with: 'does not start with', ends_with: 'ends with', not_ends_with: 'does not end with', isEmpty: 'is empty',
}
type Operator = keyof typeof operators

interface FilterItemProps {
  fields: IFilteredField[]
  onChange: (filter: Record<string, string> | null) => void
}
export type IFilterItemParam = FilterItemProps

function FilterItem({ fields, onChange }: FilterItemProps) {
  const options = fields.map(field => typeof field === 'string' ? { name: field, title: field } : { name: field.name, title: field.title || field.name })
  const [field, setField] = useState(options[0]?.name || '')
  const [operator, setOperator] = useState<Operator>('contains')
  const [text, setText] = useState('')
  function emit(nextField: string, nextOperator: Operator, nextText: string) {
    onChange(!nextField || (!nextText && nextOperator !== 'isEmpty') ? null : { [`${nextField}_${nextOperator}`]: nextText })
  }
  return <div className="flex w-full flex-wrap gap-3" role="group" aria-label="List filter">
    <select className="field-input sm:w-auto" aria-label="Filter field" value={field} onChange={event => { setField(event.target.value); emit(event.target.value, operator, text) }}>
      {options.map(option => <option key={option.name} value={option.name}>{option.title}</option>)}
    </select>
    <select className="field-input sm:w-auto" aria-label="Filter operator" value={operator} onChange={event => { const value = event.target.value as Operator; setOperator(value); emit(field, value, text) }}>
      {Object.entries(operators).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    <input className="field-input min-w-40 flex-1" aria-label="Filter value" value={text} disabled={operator === 'isEmpty'} onChange={event => { setText(event.target.value); emit(field, operator, event.target.value) }} />
  </div>
}

export default FilterItem
