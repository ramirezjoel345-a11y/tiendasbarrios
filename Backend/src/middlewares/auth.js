// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const [, token] = h.split(' ');
  if (!token) return res.status(401).json({ ok:false, message:'Falta Authorization Bearer' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('JWT error:', e.message);
    }
    return res.status(401).json({ ok:false, message:'Token inválido' });
  }
}

module.exports = auth;            // 👈 exporta la FUNCIÓN
// NO uses module.exports = { auth } aquí
