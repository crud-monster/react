import axios from 'axios'
import { sessionEndpoint, sessionRequestOptions, usesHttpOnlySession } from './session/config'
import { getAccessToken, getRefreshToken, getSessionUserId } from './session/storage'

export const refreshToken = async () => {
  if (usesHttpOnlySession()) {
    return axios.post(sessionEndpoint('refresh'), {}, sessionRequestOptions())
  }
  return axios.post(import.meta.env.VITE_HOST || '/graphql', {
    query: `mutation refreshToken($userId: ID!, $token: String!, $refreshToken: String!) {
      refreshToken_v1(userId: $userId, token: $token, refreshToken: $refreshToken) { token refreshToken }
    }`,
    variables: {
      userId: getSessionUserId(),
      token: getAccessToken(),
      refreshToken: getRefreshToken(),
    },
  }, sessionRequestOptions())
}
