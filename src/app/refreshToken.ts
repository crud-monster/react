import axios from 'axios'
import type { SessionTokens } from './authenticationLink'

interface RefreshTokenResponse {
    data?: { refreshToken_v1?: SessionTokens }
    errors?: { message: string }[]
}

export const refreshToken = async () => {
    const userId = localStorage.getItem('user.id')
    const token = localStorage.getItem('user.token')
    const refreshToken = localStorage.getItem('user.refreshToken')
    return axios.post<RefreshTokenResponse>(import.meta.env.VITE_HOST || '/graphql', {
        query: `
            mutation refreshToken($userId: ID!, $token: String!, $refreshToken:String!){
                refreshToken_v1(userId: $userId, token: $token, refreshToken:$refreshToken){
                    token,
                    refreshToken
                }
            }
        `,
        variables: {
            userId,
            token,
            refreshToken
        }
    })
}
