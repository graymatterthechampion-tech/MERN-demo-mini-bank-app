const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const auth = require('../config/controllers/authController');
const bills = require('../config/controllers/billController');
const admin = require('../config/controllers/adminController');

const router = express.Router();

router.post('/auth/register', auth.registeruser);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.getme);
router.get('/auth/lookup/:accountNumber', protect, auth.lookup);

router.get('/account/dashboard', protect, auth.getdashboard);
router.get('/account/transactions', protect, auth.transactions);
router.post('/account/transfer', protect, auth.transfer);
router.post('/account/withdraw', protect, auth.withdraw);
router.post('/account/deposit', protect, auth.deposit);

router.post('/bills/airtime', protect, bills.airtime);
router.post('/bills/data', protect, bills.getdata);
router.post('/bills/electricity', protect, bills.electricity);

router.post('/loans/apply', protect, bills.getloan);
router.get('/loans/my-loans', protect, bills.myloans);

router.get('/admin/stats', protect, adminOnly, admin.getStats);
router.get('/admin/users', protect, adminOnly, admin.getUsers);
router.post('/admin/users', protect, adminOnly, admin.createUser);
router.put('/admin/users/:id', protect, adminOnly, admin.updateUser);
router.put('/admin/users/:id/ban', protect, adminOnly, admin.toggleBan);
router.get('/admin/loans', protect, adminOnly, admin.getLoans);
router.put('/admin/loans/:id/status', protect, adminOnly, admin.updateLoanStatus);
router.get('/admin/transactions', protect, adminOnly, admin.getTransactions);

module.exports = router;
