import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { clearSession, getSession, saveSession } from '../session/storage'
import type { Session, UserWithToken } from '../session/types'

export type { User, UserRole, UserWithToken } from '../session/types'
export type UserToken = Session
export interface UserState {
  user?: UserWithToken
  state: 'no-user' | 'processing' | 'user-login'
}

const restored = getSession()
const initialState: UserState = {
  user: restored ? { ...restored.user, token: restored.token } : undefined,
  state: restored ? 'user-login' : 'no-user',
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeState(state, action: PayloadAction<UserState['state']>) { state.state = action.payload },
    login(state, action: PayloadAction<Session>) {
      saveSession(action.payload)
      state.user = { ...action.payload.user, token: action.payload.token }
      state.state = 'user-login'
    },
    sessionRefreshed(state, action: PayloadAction<Session>) {
      saveSession(action.payload, { refreshed: true })
      state.user = { ...action.payload.user, token: action.payload.token }
      state.state = 'user-login'
    },
    logout(state) {
      clearSession()
      delete state.user
      state.state = 'no-user'
    },
  },
})

export const selectUser = (state: RootState) => state.user.user
export const { login, logout, changeState, sessionRefreshed } = userSlice.actions
export default userSlice.reducer
