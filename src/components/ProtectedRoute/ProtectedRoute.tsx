import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route } from 'react-router-dom'
import { selectUser } from '../../app/reducers/userSlice'

interface ProtectedRouteProps {
    path: string
    role?: string
    exact?: boolean
    children?: React.ReactNode
}

function ProtectedRoute({ path, role, exact, children }: ProtectedRouteProps) {
    const user = useSelector(selectUser)

    if (role && !user?.roles.find(r => r.name === role)) {
        return (<Redirect to={`/login?path=${path}&role=${role}`} />)
    }

    if (!user?.token) {
        return (<Redirect to={`/login?path=${path}`} />)
    }

    return (<Route path={path} exact={exact} children={children} />)
}

export default ProtectedRoute
