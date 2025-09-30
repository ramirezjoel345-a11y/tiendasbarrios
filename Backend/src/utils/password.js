const bcrypt = require('bcryptjs');

module.exports = {
  async hash(plain) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  },
  async compare(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
};
