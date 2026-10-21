const User = require('../models/Users');

const generateUniqueAccountNumber = async () => {
  for (let i = 0; i < 25; i++) {
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    const acc = '10' + random8.substring(0, 8);
    const existing = await User.findOne({ accountNumber: acc });
    if (!existing) return acc;
  }
  return '10' + Date.now().toString().slice(-8);
};

const generateMeterToken = () => {
  const p1 = Math.floor(1000 + Math.random() * 9000);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  const p4 = Math.floor(1000 + Math.random() * 9000);
  return `${p1}-${p2}-${p3}-${p4}`;
};

module.exports = {
  generateMeterToken, generateUniqueAccountNumber
}