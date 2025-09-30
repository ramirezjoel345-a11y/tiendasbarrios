// src/middlewares/requireAuth.js
const { verifyAccess } = require('../utils/jwt');

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'no token provided' });

  const token = auth.slice(7);
  try {
    req.user = verifyAccess(token); // { sub, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
};
