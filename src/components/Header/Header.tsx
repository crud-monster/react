import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUser } from '../../app/reducers/userSlice'
import apolloClient from '../../app/apolloClient'

function Header() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const admin = user?.roles?.some(role => role.name === 'admin')
  function onLogout() {
    dispatch(logout())
    void apolloClient.clearStore()
  }
  return <header className="border-b border-slate-200 bg-white">
    <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-4 py-4 sm:px-6">
      <Link to="/" className="mr-auto text-lg font-bold tracking-tight text-slate-900">CRUD Monster</Link>
      {user?.token ? <>
        <Link to="/user/dashboard">Dashboard</Link>
        {admin && <><Link to="/admin/users">Users</Link><Link to="/admin/roles">Roles</Link></>}
        <span className="max-w-48 truncate text-sm text-slate-500">{user.email}</span>
        <Link to="/" onClick={onLogout}>Logout</Link>
      </> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
    </nav>
  </header>
}

export default Header
