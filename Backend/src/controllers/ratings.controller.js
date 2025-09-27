// backend/src/controllers/ratings.controller.js
const { fn, col } = require('sequelize');
const { StoreRating } = require('../models');

exports.listByStore = async (req, res) => {
  const data = await StoreRating.findAll({
    where: { storeId: req.params.storeId },
    order: [['createdAt', 'DESC']],
  });
  res.json({ ok: true, data });
};

exports.avgForStore = async (req, res) => {
  const result = await StoreRating.findOne({
    attributes: [[fn('AVG', col('rating')), 'avg']],
    where: { storeId: req.params.storeId },
    raw: true,
  });

  const avg = result?.avg ? Number(result.avg) : null;
  res.json({ ok: true, data: { avg } });
};

exports.upsertForUser = async (req, res) => {
  const { rating, comment } = req.body || {};
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ ok: false, message: 'rating 1-5 requerido' });

  const [row] = await StoreRating.upsert(
    { storeId: req.params.storeId, userId: req.user.id, rating, comment },
    { returning: true, conflictFields: ['storeId', 'userId'] }
  );
  res.status(201).json({ ok: true, data: row });
};