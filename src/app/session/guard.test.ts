import { ApolloClient, ApolloLink, gql, InMemoryCache, Observable } from '@apollo/client'
import { vi } from 'vitest'
import { createSessionGuard } from './guard'
import { clearSession, sessionRevision } from './storage'

const query = gql`query PrivateData { privateData }`
beforeEach(() => { vi.stubEnv('VITE_AUTH_MODE', 'legacy'); clearSession() })
afterEach(() => { clearSession(); vi.unstubAllEnvs() })

test('an old response cannot populate the cache after logout', async () => {
  let respond!: () => void
  const transport = new ApolloLink(() => new Observable(observer => {
    respond = () => { observer.next({ data: { privateData: 'previous-account' } }); observer.complete() }
  }))
  const cache = new InMemoryCache()
  const client = new ApolloClient({ cache, link: createSessionGuard().concat(transport) })
  const rejection = expect(client.query({ query })).rejects.toThrow('Session changed')
  await vi.waitFor(() => expect(respond).toBeTypeOf('function'))
  clearSession()
  respond()
  await rejection
  expect(JSON.stringify(cache.extract())).not.toContain('previous-account')
  client.stop()
})

test('a request authorized before logout is blocked before transport begins', async () => {
  const transport = vi.fn(() => Observable.of({ data: { privateData: 'unexpected' } }))
  const authorizeThenLogout = new ApolloLink((operation, forward) => {
    operation.setContext({ sessionRevision: sessionRevision() })
    clearSession()
    return forward(operation)
  })
  const client = new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.from([authorizeThenLogout, createSessionGuard(), new ApolloLink(transport)]) })
  await expect(client.query({ query })).rejects.toThrow('Session changed')
  expect(transport).not.toHaveBeenCalled()
  client.stop()
})
