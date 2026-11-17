import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'
import { getMainDefinition } from '@apollo/client/utilities'
import { ServerError } from '@apollo/client/errors'
import { createAuthenticationLink } from './authenticationLink'
import { refreshToken } from './refreshToken'
import { store } from './store'
import { logout, refreshAccessToken } from './reducers/userSlice'

const retryLink = new RetryLink({
  attempts: (count, operation, error) => {
    if (ServerError.is(error) && error.statusCode < 500) return false
    const definition = getMainDefinition(operation.query)
    return count < 3 && definition.kind === 'OperationDefinition' && definition.operation === 'query'
  },
  delay: { initial: 300, max: 2000, jitter: true },
})

const authentication = createAuthenticationLink({
  refresh: async () => {
    const { data } = await refreshToken()
    const tokens = data.data?.refreshToken_v1
    if (!tokens?.token || !tokens.refreshToken) {
      throw new Error(data.errors?.[0]?.message || 'Session could not be refreshed')
    }
    return tokens
  },
  onRefresh: tokens => store.dispatch(refreshAccessToken(tokens.token)),
  onExpired: () => {
    store.dispatch(logout())
    void apolloClient.clearStore()
  },
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    authentication,
    retryLink,
    new HttpLink({ uri: import.meta.env.VITE_HOST || '/graphql' }),
  ]),
  cache: new InMemoryCache(),

})

export default apolloClient
