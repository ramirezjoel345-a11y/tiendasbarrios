const { Store, StoreMember } = require('../models');

async function requireStoreMember(req, res, next) {
  try {
    const storeId = req.params.id || req.body.storeId || req.body.store_id;
    if (!storeId) return res.status(400).json({ error: 'storeId required' });

    const membership = await StoreMember.findOne({
      where: { store_id: storeId, user_id: req.user.sub },
    });
    if (!membership) return res.status(403).json({ error: 'not a member' });

    req.store = await Store.findByPk(storeId);
    req.membership = membership;
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal error' });
  }
}

function requireStoreRole(...roles) {
  const allowed = roles.map(r => String(r).toUpperCase());
  return (req, res, next) => {
    if (!req.membership) return res.status(500).json({ error: 'membership not loaded' });
    const role = String(req.membership.role || '').toUpperCase();
    if (!allowed.includes(role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

module.exports = { requireStoreMember, requireStoreRole };
