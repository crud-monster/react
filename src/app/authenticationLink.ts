import { ApolloLink } from '@apollo/client'
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { catchError, from, mergeMap, tap, throwError } from 'rxjs'

export interface SessionTokens {
  token: string
  refreshToken: string
}

interface AuthenticationOptions {
  refresh: () => Promise<SessionTokens>
  onRefresh?: (tokens: SessionTokens) => void
  onExpired?: () => void
  storage?: Storage
}

export function createAuthenticationLink({ refresh, onRefresh, onExpired, storage = localStorage }: AuthenticationOptions) {
  let pendingRefresh: Promise<SessionTokens> | undefined
  const expireSession = () => {
    for (const key of ['user.token', 'user.refreshToken', 'user.id', 'user.roles', 'user.verified']) storage.removeItem(key)
    onExpired?.()
  }
  const expired = (error: unknown) =>
    (ServerError.is(error) && error.statusCode === 401) ||
    (CombinedGraphQLErrors.is(error) && error.errors.some(item =>
      item.extensions?.code === 'UNAUTHENTICATED' ||
      item.extensions?.code === 'TOKEN_EXPIRED' ||
      item.extensions?.tokenExpired === true ||
      ('tokenExpired' in item && item.tokenExpired === true)
    ))

  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (!expired(error) || !storage.getItem('user.token')) return
    pendingRefresh ??= Promise.resolve().then(refresh).then(tokens => {
      if (!tokens.token || !tokens.refreshToken) throw new Error('Invalid refresh-token response')
      storage.setItem('user.token', tokens.token)
      storage.setItem('user.refreshToken', tokens.refreshToken)
      onRefresh?.(tokens)
      return tokens
    }).catch(error => {
      expireSession()
      throw error
    }).finally(() => { pendingRefresh = undefined })

    return from(pendingRefresh).pipe(mergeMap(() => forward(operation).pipe(
      tap(result => {
        if (result.errors && expired(new CombinedGraphQLErrors(result))) expireSession()
      }),
      catchError(error => {
        if (expired(error)) expireSession()
        return throwError(() => error)
      }),
    )))
  })
  const authLink = new SetContextLink(previous => ({
    headers: {
      ...previous.headers,
      authorization: storage.getItem('user.token') ? `Bearer ${storage.getItem('user.token')}` : '',
    },
  }))
  return ApolloLink.from([errorLink, authLink])
}
