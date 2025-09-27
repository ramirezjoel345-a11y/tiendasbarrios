const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hashPassword, comparePassword };
