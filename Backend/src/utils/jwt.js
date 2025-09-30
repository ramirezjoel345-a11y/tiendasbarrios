// src/utils/jwt.js
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret_change_me';
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES || '15m';

const REFRESH_SECRET = process.env.REFRESH_JWT_SECRET || 'dev_refresh_secret_change_me';
const REFRESH_EXPIRES_IN = process.env.REFRESH_JWT_EXPIRES || '7d';

function signAccess(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}
function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}
function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  signAccess,
  verifyAccess,
  signRefresh,
  verifyRefresh
};
