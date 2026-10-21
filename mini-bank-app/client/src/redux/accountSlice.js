import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { updateLocalBalance } from './authSlice';

export const fetchDashboard = createAsyncThunk(
  'account/fetchDashboard',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.get('/account/dashboard');
      if (res.data.user?.balance !== undefined) {
        dispatch(updateLocalBalance(res.data.user.balance));
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard data.');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'account/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/account/transactions');
      return res.data.transactions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load transactions.');
    }
  }
);

export const sendTransfer = createAsyncThunk(
  'account/sendTransfer',
  async ({ recipientAccountNumber, amount, description }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/account/transfer', { recipientAccountNumber, amount, description });
      dispatch(updateLocalBalance(res.data.newBalance));
      dispatch(fetchDashboard());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Transfer failed.');
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  'account/withdrawFunds',
  async ({ amount, bankName, accountNumber, accountName }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/account/withdraw', { amount, bankName, accountNumber, accountName });
      dispatch(updateLocalBalance(res.data.newBalance));
      dispatch(fetchDashboard());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Withdrawal failed.');
    }
  }
);

export const depositFunds = createAsyncThunk(
  'account/depositFunds',
  async ({ amount, channel }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/account/deposit', { amount, channel });
      dispatch(updateLocalBalance(res.data.newBalance));
      dispatch(fetchDashboard());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Deposit failed.');
    }
  }
);

export const payAirtime = createAsyncThunk(
  'account/payAirtime',
  async ({ provider, phone, amount }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/bills/airtime', { provider, phone, amount });
      dispatch(updateLocalBalance(res.data.newBalance));
      dispatch(fetchDashboard());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Airtime purchase failed.');
    }
  }
);

export const payData = createAsyncThunk(
  'account/payData',
  async ({ provider, phone, planName, amount }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/bills/data', { provider, phone, planName, amount });
      dispatch(updateLocalBalance(res.data.newBalance));
      dispatch(fetchDashboard());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Data purchase failed.');
    }
  }
);

export const payElectricity = createAsyncThunk(
  'account/payElectricity',
  async ({ disco, meterNumber, meterType, amount }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/bills/electricity', { disco, meterNumber, meterType, amount });
      dispatch(updateLocalBalance(res.data.newBalance));
      dispatch(fetchDashboard());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Electricity payment failed.');
    }
  }
);

export const applyForLoan = createAsyncThunk(
  'account/applyForLoan',
  async ({ amount, purpose, durationMonths }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/loans/apply', { amount, purpose, durationMonths });
      dispatch(fetchDashboard());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Loan application failed.');
    }
  }
);

export const fetchMyLoans = createAsyncThunk(
  'account/fetchMyLoans',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/loans/my-loans');
      return res.data.loans;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch loans.');
    }
  }
);

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    stats: {
      totalSent: 0,
      totalReceived: 0,
      transactionCount: 0,
      activeLoansCount: 0,
      pendingLoansCount: 0
    },
    recentTransactions: [],
    allTransactions: [],
    myLoans: [],
    loading: false,
    actionLoading: false,
    error: null,
    actionSuccess: null
  },
  reducers: {
    clearAccountStatus(state) {
      state.error = null;
      state.actionSuccess = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats || state.stats;
        state.recentTransactions = action.payload.recentTransactions || [];
        state.myLoans = action.payload.recentLoans || state.myLoans;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Transactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.allTransactions = action.payload;
      })
      // My Loans
      .addCase(fetchMyLoans.fulfilled, (state, action) => {
        state.myLoans = action.payload;
      })
      // Action loading states
      .addMatcher(
        (action) => action.type.endsWith('/pending') && !action.type.startsWith('account/fetch'),
        (state) => {
          state.actionLoading = true;
          state.error = null;
          state.actionSuccess = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && !action.type.startsWith('account/fetch'),
        (state, action) => {
          state.actionLoading = false;
          state.actionSuccess = action.payload?.message || 'Operation completed successfully.';
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && !action.type.startsWith('account/fetch'),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearAccountStatus } = accountSlice.actions;
export default accountSlice.reducer;