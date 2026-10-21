const bcrypt = require('bcryptjs');
const User = require('../../models/Users');
const Transaction = require('../../models/Transaction');
const Loan = require('../../models/loan');
const { generateUniqueAccountNumber } = require('../../utils/helpers');

const getStats = async (req, res) => {
  try {
    const [users, transactions, loans] = await Promise.all([
      User.find({}).select('-password'),
      Transaction.find({}),
      Loan.find({})
    ]);
    const bannedUsers = users.filter((user) => user.status === 'banned').length;

    res.json({
      stats: {
        totalUsers: users.length,
        activeUsers: users.length - bannedUsers,
        bannedUsers,
        totalPlatformBalances: users.reduce((total, user) => total + (Number(user.balance) || 0), 0),
        totalTransactionsCount: transactions.length,
        pendingLoansCount: loans.filter((loan) => loan.status === 'pending').length,
        approvedLoansCount: loans.filter((loan) => loan.status === 'approved').length
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Error loading admin stats.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user', balance = 0 } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (await User.exists({ email: cleanEmail })) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const numericBalance = Number(balance);
    if (!Number.isFinite(numericBalance) || numericBalance < 0) {
      return res.status(400).json({ message: 'Balance must be a non-negative number.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: await bcrypt.hash(password, 10),
      accountNumber: await generateUniqueAccountNumber(),
      balance: numericBalance,
      role: role === 'admin' ? 'admin' : 'user'
    });

    if (numericBalance > 0) {
      await Transaction.create({
        userId: user._id,
        type: 'BONUS',
        amount: numericBalance,
        balanceAfter: numericBalance,
        description: 'Account created by admin',
        reference: `ADMIN_INIT_${Date.now()}`,
        counterparty: { name: req.user.name, accountNumber: req.user.accountNumber, bank: 'MiniBank' }
      });
    }

    const safeUser = user.toObject();
    delete safeUser.password;
    res.status(201).json({ message: 'User created successfully.', user: safeUser });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, balance, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (String(user._id) === String(req.user._id) && status === 'banned') {
      return res.status(400).json({ message: 'You cannot ban your active admin account.' });
    }

    if (name?.trim()) user.name = name.trim();
    if (email?.trim()) user.email = email.trim().toLowerCase();
    if (['user', 'admin'].includes(role)) user.role = role;
    if (['active', 'banned'].includes(status)) user.status = status;
    if (balance !== undefined) {
      const numericBalance = Number(balance);
      if (!Number.isFinite(numericBalance) || numericBalance < 0) {
        return res.status(400).json({ message: 'Balance must be a non-negative number.' });
      }
      user.balance = numericBalance;
    }

    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ message: 'User account updated successfully.', user: safeUser });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ message: 'Error updating user.' });
  }
};

const toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot ban yourself.' });
    }

    user.status = req.body.banned ? 'banned' : 'active';
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ message: `User ${safeUser.name} ${req.body.banned ? 'banned' : 'unbanned'}.`, user: safeUser });
  } catch (error) {
    console.error('Admin ban toggle error:', error);
    res.status(500).json({ message: 'Error toggling user ban status.' });
  }
};

const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({}).sort({ createdAt: -1 });
    res.json({ loans });
  } catch (error) {
    console.error('Admin loans error:', error);
    res.status(500).json({ message: 'Error fetching loans.' });
  }
};

const updateLoanStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Loan status must be approved or rejected.' });
    }
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });
    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending loans can be reviewed.' });
    }

    loan.status = status;
    loan.rejectionReason = status === 'rejected' ? (rejectionReason || '') : '';
    await loan.save();

    if (status === 'approved') {
      const user = await User.findById(loan.userId);
      if (!user) return res.status(404).json({ message: 'Loan applicant not found.' });
      user.balance += loan.amount;
      await user.save();
      await Transaction.create({
        userId: user._id,
        type: 'LOAN_DISBURSEMENT',
        amount: loan.amount,
        balanceAfter: user.balance,
        description: `Loan approved: ${loan.purpose}`,
        reference: `LOAN_${loan._id}`,
        counterparty: { name: 'MiniBank', accountNumber: '0000000000', bank: 'MiniBank' }
      });
    }

    res.json({ message: `Loan ${status} successfully.`, loan });
  } catch (error) {
    console.error('Admin loan review error:', error);
    res.status(500).json({ message: 'Error updating loan status.' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ createdAt: -1 }).limit(500);
    res.json({ transactions });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ message: 'Error fetching platform transactions.' });
  }
};

module.exports = { getStats, getUsers, createUser, updateUser, toggleBan, getLoans, updateLoanStatus, getTransactions };
