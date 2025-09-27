// CommonJS puro
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');         // si no usas hash, cambia a: const valid = user.password === password;
const { User } = require('../models');

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ ok:false, message:'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ ok:false, message:'Credenciales incorrectas' });

    const token = sign({ id:user.id, email:user.email, role:user.role });
    return res.json({ ok:true, token, user:{ id:user.id, email:user.email, role:user.role } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, message:'Error interno en login' });
  }
}

async function me(req, res) {
  return res.json({ ok:true, user:req.user });
}

module.exports = { login, me };
