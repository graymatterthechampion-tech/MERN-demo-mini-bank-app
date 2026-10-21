import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/admin/stats');
      return res.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin statistics.');
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/admin/users');
      return res.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users list.');
    }
  }
);

export const adminCreateUser = createAsyncThunk(
  'admin/adminCreateUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/admin/users', userData);
      dispatch(fetchAdminUsers());
      dispatch(fetchAdminStats());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create user.');
    }
  }
);

export const adminEditUser = createAsyncThunk(
  'admin/adminEditUser',
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/admin/users/${id}`, updates);
      dispatch(fetchAdminUsers());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user.');
    }
  }
);

export const adminToggleBan = createAsyncThunk(
  'admin/adminToggleBan',
  async ({ id, banned }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/admin/users/${id}/ban`, { banned });
      dispatch(fetchAdminUsers());
      dispatch(fetchAdminStats());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user ban state.');
    }
  }
);

export const fetchAdminLoans = createAsyncThunk(
  'admin/fetchAdminLoans',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/admin/loans');
      return res.data.loans;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch loans.');
    }
  }
);

export const adminUpdateLoanStatus = createAsyncThunk(
  'admin/adminUpdateLoanStatus',
  async ({ id, status, rejectionReason }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/admin/loans/${id}/status`, { status, rejectionReason });
      dispatch(fetchAdminLoans());
      dispatch(fetchAdminStats());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update loan status.');
    }
  }
);

export const fetchAdminTransactions = createAsyncThunk(
  'admin/fetchAdminTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/admin/transactions');
      return res.data.transactions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch platform transactions.');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      totalPlatformBalances: 0,
      totalTransactionsCount: 0,
      pendingLoansCount: 0,
      approvedLoansCount: 0
    },
    users: [],
    loans: [],
    transactions: [],
    loading: false,
    actionLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearAdminStatus(state) {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Loans
      .addCase(fetchAdminLoans.fulfilled, (state, action) => {
        state.loans = action.payload;
      })
      // Transactions
      .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      // Mutating Actions
      .addMatcher(
        (action) => action.type.startsWith('admin/admin') && action.type.endsWith('/pending'),
        (state) => {
          state.actionLoading = true;
          state.error = null;
          state.successMessage = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/admin') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.actionLoading = false;
          state.successMessage = action.payload?.message || 'Admin action successful.';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/admin') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearAdminStatus } = adminSlice.actions;
export default adminSlice.reducer;