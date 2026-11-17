import { sessionDocument } from '../../../app/session/documents';
import { getSessionUser, markVerificationToken, wasVerificationTokenUsed } from '../../../app/session/storage';
import AuthLayout from '../../../components/ui/AuthLayout';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from 'react-router-dom';
import { login } from "../../../app/reducers/userSlice";

const VERIFY_EMAIL_MUTATION = sessionDocument(gql`
  mutation verifyEmail($verifyToken: String!) {
    verifyEmail_v1(verifyToken: $verifyToken) {
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
`);

function VerifyUser() {
  const { verifyToken } = useParams<'verifyToken'>()
  const [verified, setVerified] = useState(false);

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [verify, { loading: verifying, data, error: verifiedError }] = useMutation(VERIFY_EMAIL_MUTATION, {
    errorPolicy: "none",
  });

  const pending = useRef<{ token: string; request: ReturnType<typeof verify> }>()
  useEffect(() => {
    if (!verifyToken) return
    let active = true
    let timeout: ReturnType<typeof setTimeout> | undefined
    if (getSessionUser()?.verified === true && wasVerificationTokenUsed(verifyToken)) {
      navigate('/user/dashboard', { replace: true })
      return
    }
    if (pending.current?.token !== verifyToken) pending.current = { token: verifyToken, request: verify({ variables: { verifyToken } }) }
    pending.current.request.then(({ data }) => {
      if (!active || !data) return
      dispatch(login(data.verifyEmail_v1))
      setVerified(true)
      markVerificationToken(verifyToken)
      timeout = setTimeout(() => navigate('/user/dashboard', { replace: true }), 2000)
    }).catch(() => { /* The mutation error is displayed below. */ })
    return () => { active = false; clearTimeout(timeout) }
  }, [verifyToken, verify, dispatch, navigate])


  return <AuthLayout title="Verify your account">
    {verified && <Alert variant="success">Your account was verified.</Alert>}
    {verifying && <p role="status">Verifying your account…</p>}
    {(!verifyToken || verifiedError) && <Alert variant="danger">The verification link is invalid or has already been used.</Alert>}
  </AuthLayout>
}

export default VerifyUser;
