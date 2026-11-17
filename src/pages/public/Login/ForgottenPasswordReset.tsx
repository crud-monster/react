import { sessionDocument } from '../../../app/session/documents';
import AuthLayout from '../../../components/ui/AuthLayout';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { changeState, login } from "../../../app/reducers/userSlice";
import { isPasswordValid, passwordStrong } from "../../../app/utils";
import PasswordComponent from "./PasswordComponent";

import FORGOTTEN_PASSWORD_CHECK_MUTATION from './graphql/forgotten-password-check.gql';
import FORGOTTEN_PASSWORD_RESET_MUTATION_DOCUMENT from './graphql/forgotten-password-reset.gql';
const FORGOTTEN_PASSWORD_RESET_MUTATION = sessionDocument(FORGOTTEN_PASSWORD_RESET_MUTATION_DOCUMENT);


function ForgottenPasswordReset() {
  const { token } = useParams<'token'>()
  const [password, setPassword] = useState("");
  const [copy, setCopy] = useState("");

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [doForgottenPasswordCheck, { loading: loadingForgottenPasswordCheck, data: dataForgottenPasswordCheck }] = useMutation(FORGOTTEN_PASSWORD_CHECK_MUTATION, {
    errorPolicy: "none",
  });

  const [doForgottenPasswordReset, { loading, data }] = useMutation(FORGOTTEN_PASSWORD_RESET_MUTATION, {
    errorPolicy: "none",
  });


  const { 1: setInvalidPass } = useState(false);
  const [strong, setStrong] = useState(passwordStrong(''))
  const [invalidCopy, setInvalidCopy] = useState(false);

  useEffect(() => {
    const doCheck = async () => {
      try {
        await doForgottenPasswordCheck({ variables: { token } })
      } catch (ex) {

      } finally {
      }

    }

    doCheck()

  }, [token, doForgottenPasswordCheck])

  const onReset = async () => {
    if (!strong.valid) {
      return
    }

    if (password !== copy) {
      setInvalidCopy(true)
      return
    }

    try {
      dispatch(changeState('processing'))
      const { data } = await doForgottenPasswordReset({ variables: { token, password } })
      dispatch(login(data.reset))
      navigate('/user/dashboard', { replace: true })
    } catch (ex) {


    }

  };

  const onPasswordChange = (event: any) => {
    const pass = event.target.value as string

    setPassword(pass);
    const valid = isPasswordValid(pass)
    setInvalidPass(!valid);
    setStrong(passwordStrong(pass))
  };

  const onCopyChange = (event: any) => {
    const c = event.target.value
    setCopy(c)
    setInvalidPass(false)

    if (c === password) {
      setInvalidCopy(false)
    }
  };

  if (loadingForgottenPasswordCheck) return <AuthLayout title="Reset password"><p role="status">Checking token…</p></AuthLayout>
  if (dataForgottenPasswordCheck?.check?.status !== 'valid') return <AuthLayout title="Reset password"><Alert variant="danger">The password reset link is invalid or has already been used.</Alert></AuthLayout>
  return <AuthLayout title="User Password Reset">
    <form className="space-y-5" onSubmit={event => { event.preventDefault(); void onReset() }}>
      {invalidCopy && <Alert variant="danger">The passwords do not match.</Alert>}
      <PasswordComponent password={password} onPasswordChange={onPasswordChange} strongPassword={strong} />
      <Field id="repeat-password" label="Repeat password"><input className="field-input" id="repeat-password" type="password" autoComplete="new-password" required value={copy} onChange={onCopyChange} aria-invalid={invalidCopy} /></Field>
      <Button type="submit" disabled={loading || !strong.valid}>{loading ? 'Resetting…' : 'Reset password'}</Button>
    </form>
  </AuthLayout>
}

export default ForgottenPasswordReset;

export { FORGOTTEN_PASSWORD_CHECK_MUTATION, FORGOTTEN_PASSWORD_RESET_MUTATION };
