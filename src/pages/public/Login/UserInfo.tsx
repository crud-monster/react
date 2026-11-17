import AuthLayout from '../../../components/ui/AuthLayout';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { Link, useNavigate } from 'react-router-dom';
import PasswordComponent from "./PasswordComponent";
import { passwordStrong } from "../../../app/utils";
import { useDispatch } from "react-redux";
import { login } from "../../../app/reducers/userSlice";

const CHANGE_PASSWORD_MUTATION = gql`
  mutation changePassword($userId: ID!, $oldPassword: String!, $newPassword: String!) {
    changePassword_v1(userId: $userId, oldPassword: $oldPassword, newPassword: $newPassword) {
      refreshToken
      token
      user {
        roles{name}
        id,
        email,
        verified
      }
    }
  }
`;

const VERIFY_EMAIL_RESEND_MUTATION = gql`
  mutation verifyEmailResend($userId: ID!) {
    verifyEmailResend_v1(userId: $userId) {
      status
    }
  }
`;

function UserInfo() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCopy, setNewPasswordCopy] = useState("");
  const [showPasswordChanged, setShowPasswordChanged] = useState(false);
  const [invalidPasswordCopy, setInvalidNewPasswordCopy] = useState(false);

  const [showVerifyEmailSended, setShowVerifyEmailSended] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch()

  

  const [invalidOldPassword, setInvalidOldPassword] = useState(false);

  const [invalidPass, setInvalidPass] = useState(false);
  const [validPass, setValidPass] = useState(false);
  const [strong, setStrong] = useState(passwordStrong(''))

  

  const userId = localStorage.getItem('user.id') || ''
  const userEmail = localStorage.getItem('user.email') || ''
  const userVerified = localStorage.getItem('user.verified') == 'true'

  const [changePassword, { loading, data, error }] = useMutation(CHANGE_PASSWORD_MUTATION, {
    errorPolicy: "none",
  });

  const [verifyEmailResend, { loading: resendLoading, data: resend, error: resendError }] = useMutation(VERIFY_EMAIL_RESEND_MUTATION, {
    errorPolicy: "none",
  });

  const onVerifyEmailResend = async () => {

    try {
      const { data } = await verifyEmailResend({ variables: { userId } })
      setShowVerifyEmailSended(true)
      // show notify
      setTimeout(()=>{
        setShowVerifyEmailSended(false)
      }, 5000)
    } catch (ex) {
        console.log('onError', data)
      }
  
  };

  const onChangePassword = async () => {
    if(!strong.valid) return

    if (newPassword !== newPasswordCopy) {
      setInvalidNewPasswordCopy(true)
      return
    }

    try {
      const { data } = await changePassword({ variables: { userId, oldPassword, newPassword } })
      dispatch(login(data.changePassword_v1))
      setShowPasswordChanged(true)
      
      setOldPassword('')
      setNewPassword('')
      setNewPasswordCopy('')

      // show notify
      setTimeout(()=>{
        setShowPasswordChanged(false)
      }, 5000)
    } catch (ex) {
        console.log('onError', data)
        setInvalidOldPassword(true)
      }
  
  };


  const onCurrentPasswordChange = (event: any) => {
    setOldPassword(event.target.value);
    setInvalidOldPassword(false);
  };

  const onNewPasswordChange = (event: any) => {
    const pass = event.target.value as string
    setStrong(passwordStrong(pass))

    setNewPassword(pass);
    setInvalidOldPassword(false);
    setInvalidPass(false);

    
    if (pass == newPasswordCopy) {
      setInvalidNewPasswordCopy(false)
    }
  };

  const onNewPasswordCopyChange = (event: any) => {
    const c = event.target.value
    setNewPasswordCopy(c)
    setInvalidOldPassword(false)
    setInvalidPass(false)

    if (c == newPassword) {
      setInvalidNewPasswordCopy(false)
    }
  };

  return <main className="page space-y-8">
    <h1>User settings</h1>
    {showPasswordChanged && <Alert variant="success">Your password was changed.</Alert>}
    {showVerifyEmailSended && <Alert variant="success">Verification email sent to {userEmail}.</Alert>}
    <section className="auth-card space-y-4"><h2>Email</h2><p>{userEmail}</p>
      {userVerified ? <p>Verified</p> : <Button onClick={() => void onVerifyEmailResend()} disabled={resendLoading || showVerifyEmailSended}>Resend verification email</Button>}
      {resendError && <Alert variant="danger">{resendError.message}</Alert>}
    </section>
    <section className="auth-card"><h2 className="mb-5">Change password</h2>
      <form className="space-y-5" onSubmit={event => { event.preventDefault(); void onChangePassword() }}>
        {invalidOldPassword && <Alert variant="danger">The current password is incorrect.</Alert>}
        {invalidPasswordCopy && <Alert variant="danger">The passwords do not match.</Alert>}
        <Field id="current-password" label="Current password"><input className="field-input" id="current-password" type="password" autoComplete="current-password" required value={oldPassword} onChange={onCurrentPasswordChange} aria-invalid={invalidOldPassword} /></Field>
        <PasswordComponent password={newPassword} onPasswordChange={onNewPasswordChange} strongPassword={strong} />
        <Field id="repeat-password" label="Repeat new password"><input className="field-input" id="repeat-password" type="password" autoComplete="new-password" required value={newPasswordCopy} onChange={onNewPasswordCopyChange} aria-invalid={invalidPasswordCopy} /></Field>
        <Button type="submit" disabled={loading || !strong.valid}>{loading ? 'Saving…' : 'Change password'}</Button>
      </form>
    </section>
  </main>
}

export default UserInfo;
