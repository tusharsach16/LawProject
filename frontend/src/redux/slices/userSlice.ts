import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface UserState {
  user: null | {
    id: string
    name: string
    email: string
  },
  status: boolean
  error: string | null
}

const initialState: UserState = {
  user: null,
  status: false,
  error: null,
}

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.user 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to fetch user')
    }
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = false
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = false
        state.error = action.payload as string
      })
  },
})

export default userSlice.reducer
