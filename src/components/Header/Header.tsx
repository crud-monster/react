import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../app/reducers/userSlice'
import apolloClient from '../../app/apolloClient'
import { logoutSession } from '../../app/session/lifecycle'
import Alert from '../ui/Alert'
import Button from '../ui/Button'

function Header() {
  const user = useSelector(selectUser)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const admin = user?.roles?.some(role => role.name === 'admin')
  async function onLogout() {
    setPending(true)
    setFailed(false)
    const revocation = logoutSession()
    try { await Promise.all([revocation, apolloClient.clearStore()]) }
    catch { setFailed(true) }
    finally { setPending(false) }
  }
  return <header className="border-b border-slate-200 bg-white">
    <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-4 py-4 sm:px-6">
      <Link to="/" className="mr-auto text-lg font-bold tracking-tight text-slate-900">CRUD Monster</Link>
      {user?.token ? <>
        <Link to="/user/dashboard">Dashboard</Link>
        {admin && <><Link to="/admin/users">Users</Link><Link to="/admin/roles">Roles</Link></>}
        <span className="max-w-48 truncate text-sm text-slate-500">{user.email}</span>
        <Button variant="secondary" disabled={pending} onClick={() => void onLogout()}>Logout</Button>
      </> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
      {pending && <span role="status">Signing out…</span>}
    </nav>
    {failed && <div className="mx-auto max-w-6xl px-4 pb-4"><Alert variant="warning">Server sign-out could not be confirmed. Retry before closing this page.</Alert><Button className="mt-2" disabled={pending} onClick={() => void onLogout()}>Retry sign-out</Button></div>}
  </header>
}

export default Header
