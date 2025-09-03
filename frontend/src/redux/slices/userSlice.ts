import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
// NEW: Make sure to import your updateUserProfile function
import { updateUserProfile } from '../../services/authService'; // Adjust the path if it's different

// --- (Your interfaces and initial state are unchanged) ---
interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: 'general' | 'lawstudent' | 'lawyer';
  bio?: string;
  location?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  friends?: string[];
  roleData: any;
}

interface UserState {
  user: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  user: null,
  status: 'idle',
  error: null,
};


// --- ASYNC THUNKS ---

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await axios.get('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming the backend returns the user object directly in the payload
      return response.data as UserProfile;
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

// asyncThunk for updating the profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: { commonData?: any; roleSpecificData?: any }, { rejectWithValue }) => {
    try {
      const data = await updateUserProfile(profileData);
      // The API should return an object with the updated user => { user: { ... } }
      return data.user;
    } catch (error: any) {
      const message = error.response?.data?.msg || error.message || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      localStorage.removeItem('token');
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      //to handle the updateProfile lifecycle
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading'; // Show loading state while updating
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.status = 'succeeded';
        // Update the user state with the fresh data from the backend
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser } = userSlice.actions;

export default userSlice.reducer;