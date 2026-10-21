 const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const Transaction = require('../models/Transaction');
const Loan = require('../models/loan');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return; // Database already seeded/contains data
    }

    console.log('🌱 Database is empty. Seeding initial accounts into MongoDB...');

    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashUser = await bcrypt.hash('user123', 10);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@minibank.com',
      password: hashAdmin,
      accountNumber: '1000000001',
      balance: 50000,
      role: 'admin',
      status: 'active'
    });

    const john = await User.create({
      name: 'John Doe',
      email: 'john@minibank.com',
      password: hashUser,
      accountNumber: '1010001001',
      balance: 2500,
      role: 'user',
      status: 'active'
    });

    const sarah = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@minibank.com',
      password: hashUser,
      accountNumber: '1020002002',
      balance: 1800,
      role: 'user',
      status: 'active'
    });

    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@minibank.com',
      password: hashUser,
      accountNumber: '1030003003',
      balance: 750,
      role: 'user',
      status: 'active'
    });

    // Initial welcome credits
    await Transaction.create([
      {
        userId: john._id,
        type: 'BONUS',
        amount: 2500,
        balanceAfter: 2500,
        description: 'Account Opening Welcome Credit',
        reference: 'REF_INIT_001',
        counterparty: { name: 'MiniBank Apex', accountNumber: '0000000000', bank: 'MiniBank' }
      },
      {
        userId: sarah._id,
        type: 'BONUS',
        amount: 1800,
        balanceAfter: 1800,
        description: 'Account Opening Welcome Credit',
        reference: 'REF_INIT_002',
        counterparty: { name: 'MiniBank Apex', accountNumber: '0000000000', bank: 'MiniBank' }
      }
    ]);

    // Sample pending loan
    await Loan.create({
      userId: alex._id,
      userName: alex.name,
      userEmail: alex.email,
      accountNumber: alex.accountNumber,
      amount: 500,
      purpose: 'Small equipment purchase for workstation',
      durationMonths: 3,
      status: 'pending'
    });

    console.log('✓ MongoDB seed complete (Admin + 3 Demo accounts created).');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

module.exports = seedDatabase;