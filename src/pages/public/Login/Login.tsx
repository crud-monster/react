import { sessionDocument } from '../../../app/session/documents';
import { getRememberedEmail } from '../../../app/session/storage';
import AuthLayout from '../../../components/ui/AuthLayout';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../../app/hooks';
import { changeState, login, UserToken } from '../../../app/reducers/userSlice';
import { getGraphqlMonsterClientAppRoot } from '../../../app/utils';
import { isEmailValid } from './utils';

import LOGIN_QL_DOCUMENT from './graphql/login.gql';
const LOGIN_QL = sessionDocument(LOGIN_QL_DOCUMENT);

function Login() {
    const [email, setEmail] = useState(getRememberedEmail)
    const [pass, setPass] = useState('')

    const [invalidEmail, setInvalidEmail] = useState(false)
    const [invalidPass, setInvalidPass] = useState(false)

    const navigate = useNavigate()
    const query = new URLSearchParams(useLocation().search)
    const requestedPath = query.get('path')
    const path = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') && !requestedPath.includes('\\') ? requestedPath : null
    const role = query.get('role')
    const defaultPath = import.meta.env.VITE_DEFAULT_USER_PATH || '/user/dashboard'

    const dispatch = useAppDispatch();
    const [loginMutation, { loading }] = useMutation(LOGIN_QL, { errorPolicy: 'none' });

    const onLogin = async () => {
        if (!isEmailValid(email)) {
            return setInvalidEmail(true)
        }

        try {
            dispatch(changeState('processing'))
            const { data }: any = await loginMutation({ variables: { email, pass } })
            const userToken = data.login_v1 as UserToken

            dispatch(login(userToken))
            // go to path in case user want to reach some page before login
            // or go to default path
            navigate(path || defaultPath, { replace: true })
        } catch (e) {
            setInvalidEmail(true)
            setInvalidPass(true)
            setPass('')
        }
    }

    const onEmailChange = (event: any) => {
        setEmail(event.target.value)
        setInvalidEmail(false)
        setInvalidPass(false)
    }

    const onPasswordChange = (event: any) => {
        setPass(event.target.value)
        setInvalidEmail(false)
        setInvalidPass(false)
    }

    const onBackClick = () => {
        navigate(-1)
    }

  return <AuthLayout title="User Login">
    {(role || path) && <Alert variant="warning">Please sign in{role ? ` with the ${role} role` : ''} to continue. <Link to="/">Go home</Link>.</Alert>}
    <form className="mt-5 space-y-5" onSubmit={event => { event.preventDefault(); void onLogin() }}>
      {invalidPass && <Alert variant="danger">Email or password is not valid. <Link to="/forgotten-password">Reset your password</Link>.</Alert>}
      {invalidEmail && !invalidPass && <Alert variant="danger">Enter a valid email address.</Alert>}
      <Field id="email" label="Email address"><input className="field-input" id="email" type="email" autoComplete="email" required value={email} onChange={onEmailChange} aria-invalid={invalidEmail} /></Field>
      <Field id="password" label="Password"><input className="field-input" id="password" type="password" autoComplete="current-password" required value={pass} onChange={onPasswordChange} aria-invalid={invalidPass} /></Field>
      <Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</Button>
      <p className="text-sm"><Link to="/forgotten-password">Forgot your password?</Link></p>
      <div className="border-t border-slate-200 pt-4"><p className="mb-3 text-sm text-slate-500">Or continue with</p><div className="flex flex-wrap gap-4">
        {['github', 'facebook', 'google'].map(provider => <a key={provider} href={`${getGraphqlMonsterClientAppRoot()}/auth/${provider}`}>{provider.charAt(0).toUpperCase() + provider.slice(1)}</a>)}
      </div></div>
    </form>
  </AuthLayout>
}

export default Login
export { LOGIN_QL };
