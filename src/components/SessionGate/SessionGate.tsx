import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { refreshSession } from '../../app/session/lifecycle'
import { usesHttpOnlySession } from '../../app/session/config'
import Alert from '../ui/Alert'

interface SessionGateProps { children: React.ReactNode }

function SessionGate({ children }: SessionGateProps) {
  const [restoring, setRestoring] = useState(usesHttpOnlySession)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!usesHttpOnlySession()) return
    let active = true
    refreshSession().catch(error => {
      // 401 is the normal anonymous state; other failures must not silently look successful.
      if (active && !(axios.isAxiosError(error) && error.response?.status === 401)) setFailed(true)
    }).finally(() => { if (active) setRestoring(false) })
    return () => { active = false }
  }, [])
  if (restoring) return <main className="page" role="status">Restoring your session…</main>
  return <>{failed && <div className="page"><Alert variant="warning">Your session could not be restored. Please sign in again.</Alert></div>}{children}</>
}

export default SessionGate
