import { sessionRequestOptions } from '../../../app/session/config';
import Alert from '../../../components/ui/Alert';
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '../../../app/hooks'
import { login } from '../../../app/reducers/userSlice'
import type { UserToken } from '../../../app/reducers/userSlice'
import { getGraphqlMonsterClientAppRoot } from '../../../app/utils'

export function tokenFromFacebookCode(type: string, code: string, state?: string) {
  const query = new URLSearchParams({ code })
  if (state) query.set('state', state)
  return axios.get<UserToken>(`${getGraphqlMonsterClientAppRoot()}/auth/${type}/callback?${query}`, sessionRequestOptions())
}

interface PassportCallbackProps {
  type: string
}

function PassportCallback({ type }: PassportCallbackProps) {
  const query = new URLSearchParams(useLocation().search)
  const code = query.get('code')
  const state = query.get('state')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string>()
  const pending = useRef<{ key: string; request: Promise<AxiosResponse<UserToken>> }>()

  useEffect(() => {
    let active = true
    let timeout: ReturnType<typeof setTimeout> | undefined
    const fail = (message: string) => {
      if (!active) return
      setError(message)
      timeout = setTimeout(() => navigate('/login', { replace: true }), 4000)
    }
    if (!code) fail('User denied')
    else {
      const key = `${type}:${code}:${state || ''}`
      if (pending.current?.key !== key) pending.current = { key, request: tokenFromFacebookCode(type, code, state || undefined) }
      pending.current.request.then(({ data }) => {
        if (!active) return
        dispatch(login(data))
        navigate('/user/dashboard', { replace: true })
      }).catch(error => {
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message : undefined
        fail(typeof message === 'string' ? message : error instanceof Error ? error.message : 'Login failed')
      })
    }
    return () => { active = false; clearTimeout(timeout) }
  }, [code, state, type, dispatch, navigate])

  return <>{error && <Alert variant="danger">{type} login failed: {error}. Return to <Link to="/login">Login</Link>.</Alert>}</>
}

export default PassportCallback
