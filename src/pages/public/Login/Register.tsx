import AuthLayout from '../../../components/ui/AuthLayout';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from "../../../app/hooks";
import { changeState, login, UserToken } from "../../../app/reducers/userSlice";
import { isEmailValid, passwordStrong } from "../../../app/utils";
import PasswordComponent from "./PasswordComponent";

import REGISTER_MUTATION from './graphql/register.gql';

function Register() {
  const defaultPath = import.meta.env.VITE_DEFAULT_USER_PATH || '/user/dashboard'

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [copy, setCopy] = useState("");

  const navigate = useNavigate()
  const dispatch = useAppDispatch();

  const [registerMutation, { loading, data }] = useMutation(REGISTER_MUTATION, {
    errorPolicy: "none",
  });

  const [invalidEmail, setInvalidEmail] = useState(false);
  const [emailProbablyTaken, setEmailProbablyTaken] = useState(false);
  const [strong, setStrong] = useState(passwordStrong(''))

  const [invalidCopy, setInvalidCopy] = useState(false);

  const onRegister = async () => {
    if (!isEmailValid(email)) {
      return setInvalidEmail(true)
    }

    if (pass !== copy) {
      setInvalidCopy(true)
      return
    }

    try {
      dispatch(changeState('processing'))
      const { data } = await registerMutation({ variables: { email, pass } })
      const userToken = data.register_v1 as UserToken

      dispatch(login(userToken))

      navigate(defaultPath, { replace: true })
    } catch (ex) {
      console.log('onError', data)
      setEmailProbablyTaken(true)
    }

  };

  const onEmailChange = (event: any) => {
    setEmail(event.target.value);
    setInvalidEmail(false);
    setEmailProbablyTaken(false)
  };

  const onPasswordChange = (event: any) => {
    const pass = event.target.value as string

    setPass(pass);
    setInvalidEmail(false);
    setStrong(passwordStrong(pass))
  };

  const onCopyChange = (event: any) => {
    const c = event.target.value
    setCopy(c)
    setInvalidEmail(false)

    if (c === pass) {
      setInvalidCopy(false)
    }
  };

  return <AuthLayout title="User Registration">
    <form className="space-y-5" onSubmit={event => { event.preventDefault(); void onRegister() }}>
      {invalidEmail && <Alert variant="danger">Enter a valid email address.</Alert>}
      {emailProbablyTaken && <Alert variant="danger">Registration failed. If you already have an account, <Link to="/forgotten-password">reset your password</Link>.</Alert>}
      {invalidCopy && <Alert variant="danger">The passwords do not match.</Alert>}
      <Field id="email" label="Email address"><input className="field-input" id="email" type="email" autoComplete="email" required value={email} onChange={onEmailChange} aria-invalid={invalidEmail} /></Field>
      <PasswordComponent password={pass} onPasswordChange={onPasswordChange} strongPassword={strong} />
      <Field id="repeat-password" label="Repeat password"><input className="field-input" id="repeat-password" type="password" autoComplete="new-password" required value={copy} onChange={onCopyChange} aria-invalid={invalidCopy} /></Field>
      <Button type="submit" disabled={loading || !strong.valid}>{loading ? 'Creating account…' : 'Register'}</Button>
      <p className="text-sm">Already registered? <Link to="/login">Login</Link></p>
    </form>
  </AuthLayout>
}

export default Register;

export { REGISTER_MUTATION };
