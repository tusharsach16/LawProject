import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

// Types
interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface UserState {
  user: User | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UserState = {
  user: null,
  status: 'idle',
  error: null,
}

// Async thunk
export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.user as User
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer
