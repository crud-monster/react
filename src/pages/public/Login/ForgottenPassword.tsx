import AuthLayout from '../../../components/ui/AuthLayout';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { isEmailValid } from "../../../app/utils";

import FORGOTTEN_PASSWORD_REQUEST_MUTATION from './graphql/forgotten-password-request.gql';

function ForgottenPassword() {
  const [email, setEmail] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false)

  const [doForgottenPassword, { loading, data, }] = useMutation(FORGOTTEN_PASSWORD_REQUEST_MUTATION, {
    errorPolicy: "none",
  });

  const onRequestSend = async () => {
    setEmailSent(false)
    if (email && isEmailValid(email)) {
      setInvalidEmail(false)
      try {
        await doForgottenPassword({ variables: { email } })
        setEmailSent(true)
      } catch (ex) {

        setInvalidEmail(true)
      }
    } else {
      setInvalidEmail(true)
    }
  };

  const onEmailChange = (event: any) => {
    setEmail(event.target.value);
    setInvalidEmail(false);
  };

  return <AuthLayout title="Forgotten Password">
    {emailSent ? <Alert variant="success">Password recovery instructions were sent to {email}. Check your inbox and spam folder.</Alert> :
      <form className="space-y-5" onSubmit={event => { event.preventDefault(); void onRequestSend() }}>
        {invalidEmail && <Alert variant="danger">Check your email address and try again.</Alert>}
        <Field id="email" label="Email address"><input className="field-input" id="email" type="email" autoComplete="email" required value={email} onChange={onEmailChange} aria-invalid={invalidEmail} /></Field>
        <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Recovery Link'}</Button>
      </form>}
  </AuthLayout>
}

export default ForgottenPassword;
