// src/routes/stores.routes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize, Sequelize, Store, StoreMember, Message, User, StoreRating } = require('../models');
const requireAuth = require('../middlewares/requireAuth');
const { requireStoreMember, requireStoreRole } = require('../middlewares/storeAccess');

// ADMIN global o OWNER de la tienda
async function ensureAdminOrOwner(req, res, next) {
  if ((req.user.role || '').toUpperCase() === 'ADMIN') return next();
  const storeId = req.params.id;
  const membership = await StoreMember.findOne({ where: { store_id: storeId, user_id: req.user.sub } });
  if (!membership || (membership.role || '').toUpperCase() !== 'OWNER') {
    return res.status(403).json({ error: 'forbidden' });
  }
  req.membership = membership;
  return next();
}

/** Crea tienda y te asigna como OWNER */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, avatar_url } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });

    const store = await Store.create({ name, description, avatar_url });
    await StoreMember.create({ store_id: store.id, user_id: req.user.sub, role: 'OWNER' });
    return res.status(201).json({ store });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Mis tiendas (donde soy miembro) */
router.get('/', requireAuth, async (req, res) => {
  try {
    const memberships = await StoreMember.findAll({
      where: { user_id: req.user.sub },
      attributes: ['store_id','role','created_at']
    });
    const ids = memberships.map(m => m.store_id);
    const stores = ids.length ? await Store.findAll({ where: { id: { [Op.in]: ids } }, order: [['created_at','DESC']] }) : [];
    return res.json({ stores, memberships });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Detalle + mi rol + rating promedio y conteo + isOpenNow */
router.get('/:id', requireAuth, requireStoreMember, async (req, res) => {
  const store = await Store.findByPk(req.params.id);
  if (!store) return res.status(404).json({ error: 'store not found' });

  // ratings: promedio y conteo
  const agg = await StoreRating.findAll({
    where: { store_id: store.id },
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('score')), 'avg'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
    ],
    raw: true
  });
  const ratingAvg   = agg[0]?.avg   ? Number(parseFloat(agg[0].avg).toFixed(2)) : null;
  const ratingCount = agg[0]?.count ? Number(agg[0].count) : 0;

  const membersCount = await StoreMember.count({ where: { store_id: store.id }});

  // ---- mini-mejora: isOpenNow (horario simple en mismo día) ----
  let isOpenNow = null;
  if (store.open_time && store.close_time) {
    // open_time / close_time suelen venir "HH:MM:SS" → nos quedamos con HH:MM
    const open  = String(store.open_time).slice(0, 5);   // "08:00"
    const close = String(store.close_time).slice(0, 5);  // "18:00"
    const now   = new Date();
    const hhmm  = now.toTimeString().slice(0, 5);        // "HH:MM"

    // Caso simple (no cubre horarios nocturnos que cruzan medianoche)
    isOpenNow = (open <= hhmm && hhmm < close);
  }
  // ---------------------------------------------------------------

  return res.json({
    store,
    myRole: req.membership.role,
    membersCount,
    ratingAvg,
    ratingCount,
    isOpenNow
  });
});

/** Actualizar perfil de la tienda (ADMIN o OWNER) */
router.patch('/:id', requireAuth, ensureAdminOrOwner, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: 'store not found' });

    const allowed = [
      'name','description','avatar_url',
      'welcome_message','cover_url','address','lat','lng',
      'open_time','close_time'
    ];
    for (const f of allowed) if (f in req.body) store[f] = req.body[f];

    await store.save();
    return res.json({ store });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Listar miembros */
router.get('/:id/members', requireAuth, requireStoreMember, async (req, res) => {
  try {
    const rows = await StoreMember.findAll({
      where: { store_id: req.store.id },
      attributes: ['user_id','role','created_at'],
      include: [{ model: User, as: 'user', attributes: ['id','name','email'] }],
      order: [['created_at','ASC']]
    });
    return res.json({ members: rows });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Agregar miembro (solo OWNER) */
router.post('/:id/members', requireAuth, requireStoreMember, requireStoreRole('OWNER'), async (req, res) => {
  try {
    const { userId, role } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const [member] = await StoreMember.findOrCreate({
      where: { store_id: req.store.id, user_id: userId },
      defaults: { role: role || 'MEMBER' }
    });
    if (role && member.role !== role) { member.role = role; await member.save(); }

    return res.status(201).json({ member });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Quitar miembro (solo OWNER, evita borrar al último OWNER) */
router.delete('/:id/members/:userId', requireAuth, requireStoreMember, requireStoreRole('OWNER'), async (req, res) => {
  try {
    const { userId } = req.params;
    const target = await StoreMember.findOne({ where: { store_id: req.store.id, user_id: userId } });
    if (!target) return res.json({ ok: true });

    if ((target.role || '').toUpperCase() === 'OWNER') {
      const owners = await StoreMember.count({ where: { store_id: req.store.id, role: 'OWNER' } });
      if (owners <= 1) return res.status(400).json({ error: 'cannot remove last owner' });
    }

    await StoreMember.destroy({ where: { store_id: req.store.id, user_id: userId } });
    return res.json({ ok: true });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Listar mensajes */
router.get('/:id/messages', requireAuth, requireStoreMember, async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit || 30), 100);
    const before = req.query.before ? new Date(req.query.before) : null;
    const where  = { store_id: req.store.id };
    if (before) where.created_at = { [Op.lt]: before };

    const messages = await Message.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id','name','email'] }],
      order: [['created_at','DESC']],
      limit
    });
    return res.json({ messages });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Crear mensaje (REST + socket) */
router.post('/:id/messages', requireAuth, requireStoreMember, async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !content.trim()) return res.status(400).json({ error: 'content required' });

    const msg  = await Message.create({ store_id: req.store.id, user_id: req.user.sub, content: content.trim() });
    const full = await Message.findByPk(msg.id, { include: [{ model: User, as: 'author', attributes: ['id','name','email'] }] });

    const io = req.app.get('io');
    if (io) io.to(`store:${req.store.id}`).emit('store:message', { message: full });

    return res.status(201).json({ message: full });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Calificar tienda (1..5, un rating por usuario; actualiza si ya existe) */
router.post('/:id/ratings', requireAuth, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: 'store not found' });

    const score   = Number(req.body?.score || 0);
    const comment = (req.body?.comment || '').trim();
    if (!(score >= 1 && score <= 5)) return res.status(400).json({ error: 'score must be 1..5' });

    const existing = await StoreRating.findOne({ where: { store_id: store.id, user_id: req.user.sub } });
    if (existing) {
      existing.score = score;
      if (comment) existing.comment = comment;
      await existing.save();
    } else {
      await StoreRating.create({ store_id: store.id, user_id: req.user.sub, score, comment });
    }

    const agg = await StoreRating.findAll({
      where: { store_id: store.id },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('score')), 'avg'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      raw: true
    });

    return res.status(201).json({
      ok: true,
      ratingAvg:   agg[0]?.avg   ? Number(parseFloat(agg[0].avg).toFixed(2)) : null,
      ratingCount: agg[0]?.count ? Number(agg[0].count) : 0
    });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

/** Listar calificaciones */
router.get('/:id/ratings', requireAuth, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: 'store not found' });

    const limit = Math.min(Number(req.query.limit || 30), 100);
    const rows = await StoreRating.findAll({
      where: { store_id: store.id },
      include: [{ model: User, as: 'user', attributes: ['id','name','email'] }],
      order: [['created_at','DESC']],
      limit
    });
    return res.json({ ratings: rows });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal error' }); }
});

module.exports = router;
