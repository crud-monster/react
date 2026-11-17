import { useMutation, useQuery } from '@apollo/client'
import type { DocumentNode } from 'graphql'
import React, { useState } from 'react'
import Alert from '../ui/Alert'

type RelatedItem = { id: string; [key: string]: unknown }
interface ConnectBaseProps {
  value: unknown
  names?: string[]
  gql: { QUERY: DocumentNode; ADD: DocumentNode; REMOVE: DocumentNode }
  item: { id: string }
}

function ConnectBase({ value, names = [], gql, item }: ConnectBaseProps) {
  const field = names[1] || 'name'
  const selected = Array.isArray(value) ? value.map(row => String(row[field])) : [String(value)]
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const { data, loading, error: queryError } = useQuery<Record<string, RelatedItem[]>>(gql.QUERY)
  const rows = data ? Object.values(data)[0] || [] : []
  const [add] = useMutation(gql.ADD, { errorPolicy: 'none' })
  const [remove] = useMutation(gql.REMOVE, { errorPolicy: 'none' })

  async function toggle(row: RelatedItem, checked: boolean) {
    setBusy(true)
    setError(undefined)
    setOverrides(previous => ({ ...previous, [row.id]: checked }))
    try {
      await (checked ? add : remove)({ variables: { id1: row.id, id2: item.id } })
    } catch (error) {
      setOverrides(previous => ({ ...previous, [row.id]: !checked }))
      setError(error instanceof Error ? error.message : 'Could not update selection')
    } finally { setBusy(false) }
  }

  return <fieldset className="space-y-2" disabled={busy || loading}>
    <legend className="sr-only">{names[0] || 'Related items'}</legend>
    {loading && <span role="status">Loading choices…</span>}
    {(error || queryError) && <Alert variant="danger">{error || queryError?.message}</Alert>}
    {rows.map(row => <label key={row.id} className="flex items-center gap-2 text-sm">
      <input className="size-4 accent-indigo-600" type="checkbox" checked={overrides[row.id] ?? selected.includes(String(row[field]))} onChange={event => void toggle(row, event.target.checked)} />
      {String(row[field])}
    </label>)}
  </fieldset>
}

export default ConnectBase
