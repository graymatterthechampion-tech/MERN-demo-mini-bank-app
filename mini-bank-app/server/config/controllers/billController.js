const User = require('../../models/Users');
const Transaction = require('../../models/Transaction');
const Loan = require('../../models/loan');
const { generateMeterToken } = require('../../utils/helpers');

// @route   POST /api/bills/airtime
const airtime = async(req, res) => {
  try {
    const { provider, phone, amount } = req.body;
    const numAmount = Number(amount);

    if (!provider || !phone || !numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Provider, phone number, and valid amount are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.balance < numAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: $${user.balance.toLocaleString()}.`
      });
    }

    const newBalance = user.balance - numAmount;
    user.balance = newBalance;
    await user.save();

    const reference = 'AIR_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const tx = await Transaction.create({
      userId: user._id,
      type: 'BILL_PAYMENT',
      amount: numAmount,
      balanceAfter: newBalance,
      description: `Airtime Recharge - ${provider.toUpperCase()} (${phone})`,
      reference,
      counterparty: {
        name: `${provider.toUpperCase()} Telecom`,
        accountNumber: phone,
        bank: 'Telco Gateway'
      },
      metadata: {
        category: 'AIRTIME',
        provider,
        phone,
        status: 'delivered'
      }
    });

    res.json({
      message: `Successfully recharged $${numAmount} airtime to ${phone} on ${provider}!`,
      newBalance,
      transaction: tx
    });
  } catch (err) {
    console.error('Airtime error:', err);
    res.status(500).json({ message: 'Error processing airtime purchase.' });
  }
}

// @route   POST /api/bills/data
const getdata = async(req, res) => {
  try {
    const { provider, phone, planName, amount } = req.body;
    const numAmount = Number(amount);

    if (!provider || !phone || !planName || !numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Provider, phone number, data plan, and amount are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.balance < numAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: $${user.balance.toLocaleString()}.`
      });
    }

    const newBalance = user.balance - numAmount;
    user.balance = newBalance;
    await user.save();

    const reference = 'DAT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const tx = await Transaction.create({
      userId: user._id,
      type: 'BILL_PAYMENT',
      amount: numAmount,
      balanceAfter: newBalance,
      description: `Data Bundle - ${provider.toUpperCase()} ${planName} (${phone})`,
      reference,
      counterparty: {
        name: `${provider.toUpperCase()} Internet`,
        accountNumber: phone,
        bank: 'Telco Gateway'
      },
      metadata: {
        category: 'DATA',
        provider,
        phone,
        plan: planName,
        status: 'active'
      }
    });

    res.json({
      message: `Successfully purchased ${planName} data bundle for ${phone}!`,
      newBalance,
      transaction: tx
    });
  } catch (err) {
    console.error('Data bundle error:', err);
    res.status(500).json({ message: 'Error processing data plan.' });
  }
}

// @route   POST /api/bills/electricity
const electricity = async(req, res) => {
  try {
    const { disco, meterNumber, meterType = 'Prepaid', amount } = req.body;
    const numAmount = Number(amount);

    if (!disco || !meterNumber || !numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Electricity provider, meter number, and amount are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.balance < numAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: $${user.balance.toLocaleString()}.`
      });
    }

    const newBalance = user.balance - numAmount;
    user.balance = newBalance;
    await user.save();

    const token = generateMeterToken();
    const units = (numAmount * 1.85).toFixed(1) + ' kWh';
    const reference = 'POW_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const tx = await Transaction.create({
      userId: user._id,
      type: 'BILL_PAYMENT',
      amount: numAmount,
      balanceAfter: newBalance,
      description: `Electricity Token - ${disco.toUpperCase()} (${meterNumber})`,
      reference,
      counterparty: {
        name: `${disco.toUpperCase()} Disco Power`,
        accountNumber: meterNumber,
        bank: 'Utility Gateway'
      },
      metadata: {
        category: 'ELECTRICITY',
        disco,
        meterNumber,
        meterType,
        token,
        units
      }
    });

    res.json({
      message: `Electricity payment successful! Token generated.`,
      token,
      units,
      newBalance,
      transaction: tx
    });
  } catch (err) {
    console.error('Electricity error:', err);
    res.status(500).json({ message: 'Error processing electricity payment.' });
  }
}

// @route   POST /api/loans/apply
const getloan = async(req, res) => {
  try {
    const { amount, purpose, durationMonths } = req.body;
    const numAmount = Number(amount);
    const months = Number(durationMonths) || 3;

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid loan amount.' });
    }

    if (numAmount > 50000) {
      return res.status(400).json({ message: 'Maximum single loan limit is $50,000.' });
    }

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ message: 'Please specify the purpose for the loan.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Check if user already has a pending loan
    const existingLoans = await Loan.find({ userId: user._id });
    const hasPending = existingLoans.some(l => l.status === 'pending');
    if (hasPending) {
      return res.status(400).json({
        message: 'You already have an active pending loan review. Please wait for admin approval.'
      });
    }

    const newLoan = await Loan.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      accountNumber: user.accountNumber,
      amount: numAmount,
      purpose: purpose.trim(),
      durationMonths: months,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Loan application submitted successfully! Pending admin approval.',
      loan: newLoan
    });
  } catch (err) {
    console.error('Loan apply error:', err);
    res.status(500).json({ message: 'Error submitting loan application.' });
  }
}

// @route   GET /api/loans/my-loans
const myloans = async(req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ loans });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching loans.' });
  }
}

module.exports = {
  airtime, getdata, electricity, getloan, myloans
}