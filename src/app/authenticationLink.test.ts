import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client'
import { GraphQLError } from 'graphql'
import { Observable } from 'rxjs'
import { vi } from 'vitest'
import { createAuthenticationLink } from './authenticationLink'

const query = gql`query Read($id: ID!) { result(id: $id) }`
const expired = { errors: [new GraphQLError('Expired', { extensions: { code: 'UNAUTHENTICATED' } })] }

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('user.token', 'old-token')
  localStorage.setItem('user.refreshToken', 'old-refresh')
})
afterEach(() => localStorage.clear())

test('concurrent requests share one refresh and each retries once with fresh authorization', async () => {
  const refresh = vi.fn(async () => ({ token: 'new-token', refreshToken: 'new-refresh' }))
  const headers: string[] = []
  const transport = new ApolloLink(operation => new Observable(observer => {
    const token = operation.getContext().headers.authorization
    headers.push(token)
    observer.next(token === 'Bearer new-token' ? { data: { result: operation.variables.id } } : expired)
    observer.complete()
  }))
  const client = new ApolloClient({ cache: new InMemoryCache(), link: createAuthenticationLink({ refresh }).concat(transport) })

  const results = await Promise.all(['one', 'two'].map(id => client.query({ query, variables: { id } })))

  expect(refresh).toHaveBeenCalledTimes(1)
  expect(headers).toEqual(['Bearer old-token', 'Bearer old-token', 'Bearer new-token', 'Bearer new-token'])
  expect(results.map(result => result.data)).toEqual([{ result: 'one' }, { result: 'two' }])
  expect(localStorage.getItem('user.refreshToken')).toBe('new-refresh')
  client.stop()
})

test('a failed refresh rejects all waiting requests and clears the session', async () => {
  const refresh = vi.fn(async () => { throw new Error('Refresh denied') })
  const onExpired = vi.fn()
  const transport = new ApolloLink(() => new Observable(observer => {
    observer.next(expired)
    observer.complete()
  }))
  const client = new ApolloClient({ cache: new InMemoryCache(), link: createAuthenticationLink({ refresh, onExpired }).concat(transport) })
  const results = await Promise.allSettled(['one', 'two'].map(id => client.query({ query, variables: { id } })))

  expect(results.every(result => result.status === 'rejected')).toBe(true)
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(onExpired).toHaveBeenCalledTimes(1)
  expect(localStorage.getItem('user.token')).toBeNull()
  expect(localStorage.getItem('user.refreshToken')).toBeNull()
  client.stop()
})

test('a rejected fresh token terminates instead of refreshing forever', async () => {
  const refresh = vi.fn(async () => ({ token: 'new-token', refreshToken: 'new-refresh' }))
  const onExpired = vi.fn()
  const transport = new ApolloLink(() => new Observable(observer => {
    observer.next(expired)
    observer.complete()
  }))
  const client = new ApolloClient({ cache: new InMemoryCache(), link: createAuthenticationLink({ refresh, onExpired }).concat(transport) })

  await expect(client.query({ query, variables: { id: 'one' } })).rejects.toThrow('Expired')
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(onExpired).toHaveBeenCalledTimes(1)
  expect(localStorage.getItem('user.token')).toBeNull()
  client.stop()
})
