import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from 'react-router-dom';
import { login } from "../../../app/reducers/userSlice";

const VERIFY_EMAIL_MUTATION = gql`
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
`;

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
    if (localStorage.getItem('user.verified') === 'true' && localStorage.getItem('user.verifyToken') === verifyToken) {
      navigate('/user/dashboard', { replace: true })
      return
    }
    if (pending.current?.token !== verifyToken) pending.current = { token: verifyToken, request: verify({ variables: { verifyToken } }) }
    pending.current.request.then(({ data }) => {
      if (!active || !data) return
      dispatch(login(data.verifyEmail_v1))
      setVerified(true)
      localStorage.setItem('user.verifyToken', verifyToken)
      timeout = setTimeout(() => navigate('/user/dashboard', { replace: true }), 2000)
    }).catch(() => { /* The mutation error is displayed below. */ })
    return () => { active = false; clearTimeout(timeout) }
  }, [verifyToken, verify, dispatch, navigate])


  return (<section>
    <div className="center-y relative text-center" data-scroll-speed="4">
      <div className="container">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            {verified ? (<div className="alert alert-success" role="alert">Your account was verified <Button>Start creating</Button></div>) : null}
            {verifying ? (<div className="alert alert-dark" role="alert">Your accont is verifing...</div>) : null}
            {!verifyToken || verifiedError ? (<div className="alert alert-dark" role="alert">The code is invalid or already applyed</div>) : null}
          </div>
        </div>
      </div>
    </div>
  </section>)
};

export default VerifyUser;
