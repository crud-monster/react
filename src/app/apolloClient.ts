import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { getMainDefinition } from '@apollo/client/utilities'
import { refreshSession } from './session/lifecycle'
import { getAccessToken, sessionRevision } from './session/storage'
import { createSessionGuard } from './session/guard'
import { sessionRequestOptions, usesHttpOnlySession } from './session/config'
import { store } from './store'
import { logout } from './reducers/userSlice'

const isAuthenticationError = (error: { extensions?: Record<string, unknown>; tokenExpired?: boolean }) =>
  error.tokenExpired === true || error.extensions?.tokenExpired === true ||
  error.extensions?.code === 'UNAUTHENTICATED' || error.extensions?.code === 'TOKEN_EXPIRED'

const retryLink = new RetryLink({
  attempts: (count, operation, error) => {
    const revision = operation.getContext().sessionRevision
    if (revision !== undefined && revision !== sessionRevision()) return false
    const definition = getMainDefinition(operation.query)
    return count < 3 && definition.kind === 'OperationDefinition' && definition.operation === 'query' && !(error?.statusCode >= 400 && error.statusCode < 500)
  },
  delay: { initial: 300, max: 2000, jitter: true },
})

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const unauthorized = graphQLErrors?.some(isAuthenticationError) || (networkError && 'statusCode' in networkError && networkError.statusCode === 401)
  if (!unauthorized || !getAccessToken()) return
  return new Observable(observer => {
    let active = true
    let cancel: (() => void) | undefined
    refreshSession().then(() => {
      if (!active) return
      const subscription = forward(operation).subscribe({
        next: result => {
          if (result.errors?.some(isAuthenticationError)) {
            store.dispatch(logout())
            void apolloClient.clearStore()
          }
          observer.next(result)
        },
        error: error => {
          if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401) {
            store.dispatch(logout())
            void apolloClient.clearStore()
          }
          observer.error(error)
        },
        complete: () => observer.complete(),
      })
      cancel = () => subscription.unsubscribe()
    }).catch(error => {
      if (!getAccessToken()) void apolloClient.clearStore()
      if (active) observer.error(error)
    })
    return () => { active = false; cancel?.() }
  })
})

const authLink = setContext((_, previous) => ({
  sessionRevision: sessionRevision(),
  headers: {
    ...previous.headers,
    ...sessionRequestOptions().headers,
    authorization: getAccessToken() ? `Bearer ${getAccessToken()}` : '',
  },
}))

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, retryLink, authLink, createSessionGuard(), createHttpLink({
    uri: import.meta.env.VITE_HOST || '/graphql',
    credentials: usesHttpOnlySession() ? 'include' : 'same-origin',
  })]),
  cache: new InMemoryCache(),
  defaultOptions: { mutate: { errorPolicy: 'none' } },
})

export default apolloClient
