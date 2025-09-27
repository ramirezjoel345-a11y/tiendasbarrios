// backend/src/controllers/ratings.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listByStore = async (req, res) => {
  const data = await prisma.storeRating.findMany({
    where: { storeId: req.params.storeId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ ok: true, data });
};

exports.avgForStore = async (req, res) => {
  const agg = await prisma.storeRating.aggregate({
    where: { storeId: req.params.storeId },
    _avg: { rating: true }
  });
  res.json({ ok: true, data: { avg: agg._avg.rating || null } });
};

exports.upsertForUser = async (req, res) => {
  const { rating, comment } = req.body || {};
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ ok: false, message: 'rating 1-5 requerido' });

  const row = await prisma.storeRating.upsert({
    where: { storeId_userId: { storeId: req.params.storeId, userId: req.user.id } },
    update: { rating, comment },
    create: { storeId: req.params.storeId, userId: req.user.id, rating, comment }
  });
  res.status(201).json({ ok: true, data: row });
};
