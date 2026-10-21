import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('minibank_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load account.');
    }
  }
);

const authenticate = async (endpoint, credentials, rejectWithValue) => {
  try {
    const response = await api.post(endpoint, credentials);
    localStorage.setItem('minibank_token', response.data.token);
    localStorage.setItem('minibank_user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Authentication failed.');
  }
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => authenticate('/auth/login', credentials, rejectWithValue)
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => authenticate('/auth/register', userData, rejectWithValue)
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: readStoredUser(),
    isAuthenticated: Boolean(localStorage.getItem('minibank_token')),
    loading: false,
    error: null
  },
  reducers: {
    updateLocalBalance(state, action) {
      if (state.user) {
        state.user.balance = action.payload;
        localStorage.setItem('minibank_user', JSON.stringify(state.user));
      }
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('minibank_token');
      localStorage.removeItem('minibank_user');
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('minibank_token');
      localStorage.removeItem('minibank_user');
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('minibank_user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(
        (action) => ['auth/loginUser/pending', 'auth/registerUser/pending'].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => ['auth/loginUser/fulfilled', 'auth/registerUser/fulfilled'].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      )
      .addMatcher(
        (action) => ['auth/loginUser/rejected', 'auth/registerUser/rejected'].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { updateLocalBalance, clearAuth, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
