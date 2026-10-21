const User = require('../models/Users');

const generateUniqueAccountNumber = async () => {
  let accountNumber;
  let existingUser;

  do {
    accountNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
    existingUser = await User.exists({ accountNumber });
  } while (existingUser);

  return accountNumber;
};

const generateMeterToken = () =>
  Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join('');

module.exports = { generateUniqueAccountNumber, generateMeterToken };
