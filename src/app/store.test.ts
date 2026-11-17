import { store } from './store'
import type { AppThunk } from './store'
import { changeState, login, logout, selectUser } from './reducers/userSlice'
import type { UserToken } from './reducers/userSlice'

beforeEach(() => {
  store.dispatch(logout())
  store.dispatch(changeState('no-user'))
  localStorage.clear()
})

afterEach(() => {
  store.dispatch(logout())
  store.dispatch(changeState('no-user'))
  localStorage.clear()
})

test('login and logout preserve user roles and session storage behavior', () => {
  const session: UserToken = {
    token: 'access-token',
    refreshToken: 'refresh-token',
    user: { id: 'user-1', email: 'admin@example.test', verified: true, roles: [{ name: 'admin' }] },
  }

  store.dispatch(login(session))

  expect(selectUser(store.getState())).toEqual({ ...session.user, token: session.token })
  expect(localStorage.getItem('user.token')).toBe(session.token)
  expect(localStorage.getItem('user.refreshToken')).toBe(session.refreshToken)
  expect(localStorage.getItem('user.roles')).toBe('admin')

  store.dispatch(logout())

  expect(selectUser(store.getState())).toBeUndefined()
  expect(localStorage.getItem('user.token')).toBeNull()
  expect(localStorage.getItem('user.refreshToken')).toBeNull()
  expect(localStorage.getItem('user.roles')).toBeNull()
})

test('the configured store dispatches async thunks with Redux 5', async () => {
  const processUser = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    dispatch(changeState('processing'))
    await Promise.resolve()
    expect(getState().user.state).toBe('processing')
    dispatch(changeState('no-user'))
  }

  await store.dispatch(processUser())
  expect(store.getState().user.state).toBe('no-user')
})
