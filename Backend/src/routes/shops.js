const { Router } = require('express');
const { body, param, query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { authRequired } = require('../middlewares/auth');
const { requireRole, requireShopOwner } = require('../middlewares/roles');

const router = Router();

/** Helper: manejo de validaciones */
function ensureValid(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ ok: false, errors: errors.array() });
    return false;
  }
  return true;
}

/** ===================== TIENDAS ===================== */

/** GET /shops  (público)  ?q=texto  */
router.get(
  '/',
  [query('q').optional().isString().trim().isLength({ min: 1 }).withMessage('q debe ser string')],
  async (req, res, next) => {
    try {
      const q = (req.query.q || '').toString();
      const where = q
        ? {
            AND: [
              { isActive: true },
              {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } }
                ]
              }
            ]
          }
        : { isActive: true };

      const shops = await prisma.shop.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          ratings: { select: { stars: true } },
          schedules: true
        }
      });

      // Calcula promedio en memoria (simple y suficiente por ahora)
      const data = shops.map(s => {
        const count = s.ratings.length;
        const avg = count ? s.ratings.reduce((a, r) => a + r.stars, 0) / count : null;
        const { ratings, ...rest } = s;
        return { ...rest, ratingsCount: count, averageStars: avg ? Number(avg.toFixed(2)) : null };
      });

      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  }
);

/** GET /shops/:id (público) */
router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;

      const shop = await prisma.shop.findUnique({
        where: { id: req.params.id },
        include: {
          schedules: { orderBy: { dayOfWeek: 'asc' } },
          bankAccounts: true
        }
      });
      if (!shop || !shop.isActive) return res.status(404).json({ ok: false, message: 'Tienda no encontrada' });

      // promedio
      const agg = await prisma.rating.aggregate({
        where: { shopId: shop.id },
        _avg: { stars: true },
        _count: { _all: true }
      });

      res.json({
        ok: true,
        data: {
          ...shop,
          ratingsCount: agg._count._all,
          averageStars: agg._avg.stars ? Number(agg._avg.stars.toFixed(2)) : null
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

/** GET /shops/me  (tendero: lista mis tiendas) */
router.get('/me', authRequired, requireRole('TENDERO'), async (req, res, next) => {
  try {
    const shops = await prisma.shop.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, data: shops });
  } catch (err) {
    next(err);
  }
});

/** POST /shops (tendero crea tienda) */
router.post(
  '/',
  authRequired,
  requireRole('TENDERO'),
  [
    body('name').isString().trim().isLength({ min: 2 }).withMessage('Nombre requerido'),
    body('description').optional().isString().trim(),
    body('profilePhotoUrl').optional().isURL().withMessage('URL inválida'),
    body('coverPhotoUrl').optional().isURL().withMessage('URL inválida'),
    body('address').optional().isString().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Lat inválida'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Lng inválida')
  ],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;
      const { name, description, profilePhotoUrl, coverPhotoUrl, address, latitude, longitude } = req.body;

      // Prisma Decimal acepta string/number; por seguridad pasamos string si existe
      const lat = latitude !== undefined ? String(latitude) : null;
      const lng = longitude !== undefined ? String(longitude) : null;

      const shop = await prisma.shop.create({
        data: {
          ownerId: req.user.id,
          name,
          description: description || null,
          profilePhotoUrl: profilePhotoUrl || null,
          coverPhotoUrl: coverPhotoUrl || null,
          address: address || null,
          latitude: lat,
          longitude: lng
        }
      });

      res.status(201).json({ ok: true, data: shop });
    } catch (err) {
      next(err);
    }
  }
);

/** PUT /shops/:id  (tendero actualiza su tienda) */
router.put(
  '/:id',
  authRequired,
  requireRole('TENDERO'),
  requireShopOwner,
  [
    param('id').isString().notEmpty(),
    body('name').optional().isString().trim().isLength({ min: 2 }),
    body('description').optional().isString().trim(),
    body('profilePhotoUrl').optional().isURL(),
    body('coverPhotoUrl').optional().isURL(),
    body('address').optional().isString().trim(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('isActive').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;

      const { name, description, profilePhotoUrl, coverPhotoUrl, address, latitude, longitude, isActive } = req.body;

      const shop = await prisma.shop.update({
        where: { id: req.params.id },
        data: {
          name,
          description,
          profilePhotoUrl,
          coverPhotoUrl,
          address,
          latitude: latitude !== undefined ? String(latitude) : undefined,
          longitude: longitude !== undefined ? String(longitude) : undefined,
          isActive
        }
      });

      res.json({ ok: true, data: shop });
    } catch (err) {
      next(err);
    }
  }
);

/** ===================== HORARIOS ===================== */
/** PUT /shops/:id/schedules  (tendero reemplaza la semana completa)
 * body: [{ dayOfWeek:0..6, openTime:"HH:mm", closeTime:"HH:mm", isClosed:boolean }, ...]
 */
router.put(
  '/:id/schedules',
  authRequired,
  requireRole('TENDERO'),
  requireShopOwner,
  [param('id').isString().notEmpty(), body().isArray({ min: 1 })],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;
      const items = req.body;

      // Validación simple por elemento
      for (const it of items) {
        if (typeof it.dayOfWeek !== 'number' || it.dayOfWeek < 0 || it.dayOfWeek > 6) {
          return res.status(400).json({ ok: false, message: 'dayOfWeek inválido (0..6)' });
        }
        if (typeof it.isClosed !== 'boolean') {
          return res.status(400).json({ ok: false, message: 'isClosed debe ser boolean' });
        }
        if (!it.isClosed) {
          if (!/^\d{2}:\d{2}$/.test(it.openTime || '') || !/^\d{2}:\d{2}$/.test(it.closeTime || '')) {
            return res.status(400).json({ ok: false, message: 'openTime/closeTime deben ser HH:mm' });
          }
        }
      }

      // Reemplazamos: borrar y crear
      await prisma.$transaction([
        prisma.schedule.deleteMany({ where: { shopId: req.params.id } }),
        prisma.schedule.createMany({
          data: items.map(it => ({
            shopId: req.params.id,
            dayOfWeek: it.dayOfWeek,
            openTime: it.isClosed ? '00:00' : it.openTime,
            closeTime: it.isClosed ? '00:00' : it.closeTime,
            isClosed: it.isClosed
          }))
        })
      ]);

      const result = await prisma.schedule.findMany({
        where: { shopId: req.params.id },
        orderBy: { dayOfWeek: 'asc' }
      });

      res.json({ ok: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/** GET /shops/:id/schedules (público) */
router.get('/:id/schedules', [param('id').isString().notEmpty()], async (req, res, next) => {
  try {
    if (!ensureValid(req, res)) return;

    const result = await prisma.schedule.findMany({
      where: { shopId: req.params.id },
      orderBy: { dayOfWeek: 'asc' }
    });

    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
});

/** ===================== CUENTAS BANCARIAS ===================== */
/** GET /shops/:id/bank-accounts  (dueño) */
router.get(
  '/:id/bank-accounts',
  authRequired,
  requireRole('TENDERO'),
  requireShopOwner,
  async (req, res, next) => {
    try {
      const rows = await prisma.bankAccount.findMany({ where: { shopId: req.params.id } });
      res.json({ ok: true, data: rows });
    } catch (err) {
      next(err);
    }
  }
);

/** POST /shops/:id/bank-accounts (dueño) */
router.post(
  '/:id/bank-accounts',
  authRequired,
  requireRole('TENDERO'),
  requireShopOwner,
  [
    body('bankName').isString().trim().isLength({ min: 2 }),
    body('accountType').isString().trim().isLength({ min: 2 }), // Ahorros/Corriente
    body('accountNumber').isString().trim().isLength({ min: 4 }),
    body('holderName').isString().trim().isLength({ min: 2 }),
    body('documentId').optional().isString().trim()
  ],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;

      const { bankName, accountType, accountNumber, holderName, documentId } = req.body;

      const acc = await prisma.bankAccount.create({
        data: {
          shopId: req.params.id,
          bankName,
          accountType,
          accountNumber,
          holderName,
          documentId: documentId || null
        }
      });

      res.status(201).json({ ok: true, data: acc });
    } catch (err) {
      next(err);
    }
  }
);

/** DELETE /shops/:id/bank-accounts/:bankId (dueño) */
router.delete(
  '/:id/bank-accounts/:bankId',
  authRequired,
  requireRole('TENDERO'),
  requireShopOwner,
  [param('bankId').isString().notEmpty()],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;

      // Verifica que la cuenta pertenezca a esta tienda
      const found = await prisma.bankAccount.findUnique({ where: { id: req.params.bankId } });
      if (!found || found.shopId !== req.params.id) {
        return res.status(404).json({ ok: false, message: 'Cuenta no encontrada en esta tienda' });
      }

      await prisma.bankAccount.delete({ where: { id: req.params.bankId } });
      res.json({ ok: true, message: 'Cuenta eliminada' });
    } catch (err) {
      next(err);
    }
  }
);

/** ===================== CALIFICACIONES ===================== */
/** GET /shops/:id/ratings (público, con paginación simple ?page & ?pageSize) */
router.get(
  '/:id/ratings',
  [param('id').isString().notEmpty(), query('page').optional().isInt({ min: 1 }), query('pageSize').optional().isInt({ min: 1, max: 100 })],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;
      const page = parseInt(req.query.page || '1', 10);
      const pageSize = parseInt(req.query.pageSize || '10', 10);

      const [rows, total, avg] = await Promise.all([
        prisma.rating.findMany({
          where: { shopId: req.params.id },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { rater: { select: { id: true, name: true, photoUrl: true } } }
        }),
        prisma.rating.count({ where: { shopId: req.params.id } }),
        prisma.rating.aggregate({ where: { shopId: req.params.id }, _avg: { stars: true } })
      ]);

      res.json({
        ok: true,
        data: rows,
        meta: {
          total,
          page,
          pageSize,
          averageStars: avg._avg.stars ? Number(avg._avg.stars.toFixed(2)) : null
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

/** POST /shops/:id/ratings (vecino califica, 1..5; no puede calificar su propia tienda) */
router.post(
  '/:id/ratings',
  authRequired,
  requireRole('VECINO', 'TENDERO'), // permitimos tendero calificar otras tiendas; bloqueamos si es suya
  [param('id').isString().notEmpty(), body('stars').isInt({ min: 1, max: 5 }), body('comment').optional().isString().trim()],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;

      const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
      if (!shop) return res.status(404).json({ ok: false, message: 'Tienda no encontrada' });

      if (shop.ownerId === req.user.id) {
        return res.status(400).json({ ok: false, message: 'No puedes calificar tu propia tienda' });
      }

      const { stars, comment } = req.body;

      // Si ya calificó antes esta tienda, actualizamos; si no, creamos (sin índice único, lo hacemos a mano)
      const existing = await prisma.rating.findFirst({ where: { shopId: shop.id, raterId: req.user.id } });
      let rating;
      if (existing) {
        rating = await prisma.rating.update({
          where: { id: existing.id },
          data: { stars, comment: comment ?? existing.comment }
        });
      } else {
        rating = await prisma.rating.create({
          data: { shopId: shop.id, raterId: req.user.id, stars, comment: comment || null }
        });
      }

      res.status(201).json({ ok: true, data: rating });
    } catch (err) {
      next(err);
    }
  }
);
router.get(
  '/:id/messages',
  [param('id').isString().notEmpty(), query('limit').optional().isInt({ min: 1, max: 100 }), query('cursor').optional().isString()],
  async (req, res, next) => {
    try {
      if (!ensureValid(req, res)) return;

      const limit = parseInt(req.query.limit || '20', 10);
      const cursor = req.query.cursor || null;

      // buscamos por createdAt desc; para cursor usaremos id de prisma (cuid)
      const messages = await prisma.message.findMany({
        where: { shopId: req.params.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        ...(cursor
          ? {
              skip: 1,
              cursor: { id: cursor }
            }
          : {}),
        include: {
          sender: { select: { id: true, name: true, photoUrl: true, role: true } }
        }
      });

      const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

      res.json({
        ok: true,
        data: messages,
        nextCursor
      });
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
