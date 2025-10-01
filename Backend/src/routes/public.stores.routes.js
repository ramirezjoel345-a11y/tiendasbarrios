// src/routes/public.stores.routes.js
const express = require('express');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const { Store, StoreMember, StoreRating } = require('../models');

// util: calcula si está abierto ahora (caso simple mismo día)
function computeIsOpenNow(store) {
  if (!store.open_time || !store.close_time) return null;
  const open  = String(store.open_time).slice(0,5);   // "HH:MM"
  const close = String(store.close_time).slice(0,5);  // "HH:MM"
  const now   = new Date();
  const hhmm  = now.toTimeString().slice(0,5);
  return (open <= hhmm && hhmm < close);
}

// util: haversine (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

/**
 * GET /api/public/stores/:id
 * Perfil público (sin login): incluye ratingAvg, ratingCount, membersCount, isOpenNow
 */
router.get('/:id', async (req, res) => {
  const store = await Store.findByPk(req.params.id);
  if (!store) return res.status(404).json({ error: 'store not found' });

  const [agg] = await StoreRating.findAll({
    where: { store_id: store.id },
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('score')), 'avg'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
    ],
    raw: true
  });

  const ratingAvg   = agg?.avg   ? Number(parseFloat(agg.avg).toFixed(2)) : null;
  const ratingCount = agg?.count ? Number(agg.count) : 0;
  const membersCount = await StoreMember.count({ where: { store_id: store.id } });
  const isOpenNow = computeIsOpenNow(store);

  return res.json({
    store,
    membersCount,
    ratingAvg,
    ratingCount,
    isOpenNow
  });
});

/**
 * GET /api/public/stores
 * Listado público con filtros:
 *  - q=texto (name/description)
 *  - near=lat,lng (ej: 4.71,-74.07) y radius=KM (default 5)
 *  - limit=N (default 30, máx 100)
 */
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 30), 100);

  const where = {};
  if (req.query.q) {
    const q = `%${String(req.query.q).trim()}%`;
    where[Op.or] = [
      { name:        { [Op.iLike]: q } },
      { description: { [Op.iLike]: q } },
    ];
  }

  // Traemos un batch y luego calculamos distancia si aplica
  const rows = await Store.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit: 200 // pequeño colchón para filtrar por distancia
  });

  let list = rows.map(s => {
    const rating = { avg: null, count: 0 }; // placeholder; agregamos abajo si se pide
    return {
      store: s,
      ratingAvg: rating.avg,
      ratingCount: rating.count,
      isOpenNow: computeIsOpenNow(s),
      distanceKm: null
    };
  });

  // Si near/radius están presentes, calculamos distancia en JS (Haversine) y filtramos/ordenamos
  if (req.query.near) {
    const [latStr, lngStr] = String(req.query.near).split(',').map(v => v.trim());
    const lat0 = Number(latStr), lng0 = Number(lngStr);
    const radius = Number(req.query.radius || 5); // km

    list = list
      .filter(x => x.store.lat != null && x.store.lng != null)
      .map(x => {
        const d = haversineKm(Number(x.store.lat), Number(x.store.lng), lat0, lng0);
        return { ...x, distanceKm: Number(d.toFixed(2)) };
      })
      .filter(x => x.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // Carga ligera de ratings (promedio + conteo) si se pide (para no hacer N consultas siempre)
  // Por simplicidad, lo resolvemos siempre para los que quedaron en 'list' y recortamos 'limit'
  const ids = list.map(x => x.store.id);
  if (ids.length) {
    const aggs = await StoreRating.findAll({
      where: { store_id: { [Op.in]: ids } },
      attributes: [
        'store_id',
        [Sequelize.fn('AVG', Sequelize.col('score')), 'avg'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['store_id'],
      raw: true
    });
    const mapAgg = new Map(aggs.map(a => [a.store_id, a]));
    list = list.map(x => {
      const a = mapAgg.get(x.store.id);
      return {
        ...x,
        ratingAvg:   a?.avg   ? Number(parseFloat(a.avg).toFixed(2)) : null,
        ratingCount: a?.count ? Number(a.count) : 0,
      };
    });
  }

  return res.json({ stores: list.slice(0, limit) });
});

module.exports = router;
