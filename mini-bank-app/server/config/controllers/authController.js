const User = require('../../models/Users');
const Transaction = require('../../models/Transaction');
const Loan = require('../../models/loan');
const { generateUniqueAccountNumber } = require('../../utils/helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


const registeruser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const accountNumber = await generateUniqueAccountNumber();
    const hashedPassword = await bcrypt.hash(password, 10);
    const initialBalance = 1000;

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      accountNumber,
      balance: initialBalance,
      role: 'user'
    });

    // Create welcome deposit transaction
    await Transaction.create({
      userId: newUser._id,
      type: 'BONUS',
      amount: initialBalance,
      balanceAfter: initialBalance,
      description: 'Account Opening Welcome Credit',
      reference: 'REF_INIT_' + Date.now(),
      counterparty: {
        name: 'MiniBank Apex',
        accountNumber: '0000000000',
        bank: 'MiniBank'
      }
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
}

// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'This account has been banned. Please contact administrator.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: 'Login successful!',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
}

// @route   GET /api/auth/me
const getme = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving profile.' });
  }
}

// @route   GET /api/auth/lookup/:accountNumber
const lookup = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const recipient = await User.findOne({ accountNumber: accountNumber.trim() }).select('-password');
    if (!recipient) {
      return res.status(404).json({ message: 'Account number not found.' });
    }
    if (String(recipient._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot transfer funds to your own account.' });
    }
    if (recipient.status === 'banned') {
      return res.status(400).json({ message: 'Recipient account is currently suspended/banned.' });
    }

    res.json({
      accountNumber: recipient.accountNumber,
      name: recipient.name,
      email: recipient.email
    });
  } catch (err) {
    res.status(500).json({ message: 'Error checking account number.' });
  }
}

const getdashboard = async(req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
    const loans = await Loan.find({ userId: user._id }).sort({ createdAt: -1 });

    const totalSent = transactions
      .filter(t => t.type === 'TRANSFER_OUT' || t.type === 'WITHDRAWAL' || t.type === 'BILL_PAYMENT')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalReceived = transactions
      .filter(t => t.type === 'TRANSFER_IN' || t.type === 'DEPOSIT' || t.type === 'BONUS' || t.type === 'LOAN_DISBURSEMENT')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    res.json({
      user,
      stats: {
        totalSent,
        totalReceived,
        transactionCount: transactions.length,
        activeLoansCount: loans.filter(l => l.status === 'approved').length,
        pendingLoansCount: loans.filter(l => l.status === 'pending').length
      },
      recentTransactions: transactions.slice(0, 8),
      recentLoans: loans.slice(0, 3)
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ message: 'Error retrieving dashboard data.' });
  }
}

// @route   GET /api/account/transactions
const transactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: 'Error loading transactions.' });
  }
}

// @route   POST /api/account/transfer
const transfer = async (req, res) => {
  try {
    const { recipientAccountNumber, amount, description } = req.body;
    const numAmount = Number(amount);

    if (!recipientAccountNumber || !numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid recipient account number and amount greater than 0.' });
    }

    const sender = await User.findById(req.user._id);
    if (!sender) return res.status(404).json({ message: 'Sender not found.' });

    if (sender.balance < numAmount) {
      return res.status(400).json({
        message: `Insufficient funds. Your current balance is $${sender.balance.toLocaleString()}.`
      });
    }

    const recipient = await User.findOne({ accountNumber: recipientAccountNumber.trim() });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient account number does not exist.' });
    }

    if (String(recipient._id) === String(sender._id)) {
      return res.status(400).json({ message: 'Cannot transfer funds to your own account number.' });
    }

    if (recipient.status === 'banned') {
      return res.status(400).json({ message: 'Recipient account is suspended/banned.' });
    }

    const reference = 'TRX_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanDesc = description && description.trim() ? description.trim() : `Transfer to ${recipient.name}`;

    // Deduct sender balance
    const newSenderBalance = sender.balance - numAmount;
    sender.balance = newSenderBalance;
    await sender.save();

    // Credit recipient balance
    const newRecipientBalance = recipient.balance + numAmount;
    recipient.balance = newRecipientBalance;
    await recipient.save();

    // Debit transaction for sender
    const senderTx = await Transaction.create({
      userId: sender._id,
      type: 'TRANSFER_OUT',
      amount: numAmount,
      balanceAfter: newSenderBalance,
      description: cleanDesc,
      reference,
      counterparty: {
        name: recipient.name,
        accountNumber: recipient.accountNumber,
        bank: 'MiniBank'
      }
    });

    // Credit transaction for recipient
    await Transaction.create({
      userId: recipient._id,
      type: 'TRANSFER_IN',
      amount: numAmount,
      balanceAfter: newRecipientBalance,
      description: `Transfer received from ${sender.name} (${cleanDesc})`,
      reference,
      counterparty: {
        name: sender.name,
        accountNumber: sender.accountNumber,
        bank: 'MiniBank'
      }
    });

    res.json({
      message: `Successfully transferred $${numAmount.toLocaleString()} to ${recipient.name}!`,
      newBalance: newSenderBalance,
      transaction: senderTx
    });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ message: 'Server error processing transfer.' });
  }
}

// @route   POST /api/account/withdraw
const withdraw = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountName } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid withdrawal amount.' });
    }

    if (!bankName || !accountNumber) {
      return res.status(400).json({ message: 'Destination bank and account number are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.balance < numAmount) {
      return res.status(400).json({
        message: `Insufficient funds. Your available balance is $${user.balance.toLocaleString()}.`
      });
    }

    const newBalance = user.balance - numAmount;
    user.balance = newBalance;
    await user.save();

    const reference = 'WTH_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const tx = await Transaction.create({
      userId: user._id,
      type: 'WITHDRAWAL',
      amount: numAmount,
      balanceAfter: newBalance,
      description: `Withdrawal to ${bankName} (${accountNumber})`,
      reference,
      counterparty: {
        name: accountName || user.name,
        accountNumber,
        bank: bankName
      },
      metadata: {
        status: 'completed',
        channel: 'Instant Bank Payout'
      }
    });

    res.json({
      message: `Withdrawal of $${numAmount.toLocaleString()} processed successfully to ${bankName}.`,
      newBalance,
      transaction: tx
    });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ message: 'Server error processing withdrawal.' });
  }
}

// @route   POST /api/account/deposit
const deposit = async (req, res) => {
  try {
    const { amount, channel = 'Card / Demo Top-up' } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a positive deposit amount.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newBalance = user.balance + numAmount;
    user.balance = newBalance;
    await user.save();

    const reference = 'DEP_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const tx = await Transaction.create({
      userId: user._id,
      type: 'DEPOSIT',
      amount: numAmount,
      balanceAfter: newBalance,
      description: `Deposit via ${channel}`,
      reference,
      counterparty: {
        name: user.name,
        accountNumber: user.accountNumber,
        bank: 'Card Checkout'
      },
      metadata: { channel }
    });

    res.json({
      message: `Account topped up by $${numAmount.toLocaleString()} successfully!`,
      newBalance,
      transaction: tx
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ message: 'Server error processing deposit.' });
  }
}


module.exports = {
  getdashboard, transactions, transfer, withdraw, deposit, registeruser, login, getme, lookup
}