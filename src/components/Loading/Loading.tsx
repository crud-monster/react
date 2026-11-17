import React from 'react'
interface LoadingProps { what?: string }
function Loading({ what = '' }: LoadingProps) {
  return <div className="page" role="status" aria-live="polite">Loading {what}…</div>
}
export default Loading
