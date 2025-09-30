const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { hash, compare } = require('../utils/password');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const requireAuth = require('../middlewares/requireAuth');

function toPublicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function fallbackNameFromEmail(email) {
  return String(email).split('@')[0] || 'Usuario';
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'email already exists' });

    const passwordHash = await hash(password);
    const user = await User.create({
      name: name && name.trim() ? name.trim() : fallbackNameFromEmail(email),
      email,
      passwordHash,
      role: 'USER', // enum en MAYÚSCULAS
    });

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ sub: user.id });

    return res.status(201).json({ user: toPublicUser(user), accessToken, refreshToken });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ sub: user.id });

    return res.json({ user: toPublicUser(user), accessToken, refreshToken });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

    let payload;
    try {
      payload = verifyRefresh(refreshToken); // { sub }
    } catch {
      return res.status(401).json({ error: 'invalid or expired refresh token' });
    }

    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(404).json({ error: 'user not found' });

    const newAccess = signAccess({ sub: user.id, email: user.email, role: user.role, name: user.name });
    const newRefresh = signRefresh({ sub: user.id });

    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal error' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const { sub: id } = req.user;
  const user = await User.findByPk(id, { attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'] });
  if (!user) return res.status(404).json({ error: 'user not found' });
  return res.json({ user });
});

module.exports = router;
