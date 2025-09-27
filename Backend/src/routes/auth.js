// Backend/src/routes/auth.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const router = Router();

// ====== Config JWT ======
const JWT_SECRET = process.env.JWT_SECRET || 'dev_access_secret_change_me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '15m'; // access corto

const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || 'dev_refresh_secret_change_me';
const REFRESH_JWT_EXPIRES = process.env.REFRESH_JWT_EXPIRES || '7d'; // refresh largo

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function signRefresh(user) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_JWT_SECRET,
    { expiresIn: REFRESH_JWT_EXPIRES }
  );
}

function toPublicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt };
}

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: 'Faltan campos' });
    }
    const allowedRoles = ['VECINO', 'TENDERO'];
    const roleValue = allowedRoles.includes(role) ? role : 'VECINO';

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ ok: false, message: 'Email ya registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: roleValue },
    });

    const token = signAccess(user);
    const refreshToken = signRefresh(user);

    return res.status(201).json({ ok: true, token, refreshToken, user: toPublicUser(user) });
  } catch (err) { next(err); }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ ok: false, message: 'Email y password son requeridos' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });

    const token = signAccess(user);
    const refreshToken = signRefresh(user);

    return res.json({ ok: true, token, refreshToken, user: toPublicUser(user) });
  } catch (err) { next(err); }
});

// POST /auth/refresh
// Body: { refreshToken: string }
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ ok: false, message: 'Falta refreshToken' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_JWT_SECRET);
    } catch {
      return res.status(401).json({ ok: false, message: 'refreshToken inválido' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });

    const token = signAccess(user);
    // (Opcional) rotar refresh: const newRefreshToken = signRefresh(user);
    return res.json({ ok: true, token /*, refreshToken: newRefreshToken*/ });
  } catch (err) { next(err); }
});

// GET /auth/me
router.get('/me', async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, message: 'No token' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });

    res.json({ ok: true, user: toPublicUser(user) });
  } catch (err) { next(err); }
});

module.exports = router;
