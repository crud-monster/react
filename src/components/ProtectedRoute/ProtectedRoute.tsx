import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectUser } from '../../app/reducers/userSlice'

interface ProtectedRouteProps {
  role?: string
  children: React.ReactNode
}

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const user = useSelector(selectUser)
  const location = useLocation()
  if (!user?.token || (role && !user.roles?.some(item => item.name === role))) {
    const query = new URLSearchParams({ path: location.pathname + location.search + location.hash })
    if (role) query.set('role', role)
    return <Navigate to={`/login?${query.toString()}`} replace />
  }
  return <>{children}</>
}

export default ProtectedRoute
