const { Store } = require('../models');

/** Requiere que el usuario tenga uno de los roles dados */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, message: 'No autenticado' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: 'No autorizado' });
    }
    next();
  };
}

/** Carga la tienda y verifica que el usuario sea el dueño */
async function requireShopOwner(req, res, next) {
  try {
    const { id } = req.params;
    const shop = await Store.findByPk(id);
    if (!shop) return res.status(404).json({ ok: false, message: 'Tienda no encontrada' });
    if (shop.ownerUserId !== req.user.id) {
      return res.status(403).json({ ok: false, message: 'No eres dueño de esta tienda' });
    }
    req.shop = shop;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireRole, requireShopOwner };