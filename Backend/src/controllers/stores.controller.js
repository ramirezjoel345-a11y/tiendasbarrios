// backend/src/controllers/stores.controller.js
const { Op } = require('sequelize');
const { Store } = require('../models');

exports.create = async (req, res) => {
  try {
    const ownerUserId = req.user.id;
    const { name, slug, description, photoUrl, coverUrl, phone, addressLine, lat, lng } = req.body;

    const store = await Store.create({
      name,
      slug,
      description,
      photoUrl,
      coverUrl,
      phone,
      addressLine,
      lat,
      lng,
      ownerUserId
    });

    res.status(201).json({ ok: true, data: store });
  } catch (e) {
    console.error('stores.create', e);
    res.status(500).json({ ok: false, message: 'Error creando tienda' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q } = req.query;
    const where = q
      ? { name: { [Op.iLike]: `%${q}%` } }
      : {};
    
    const data = await Store.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({ ok: true, data });
  } catch (e) {
    console.error('stores.list', e);
    res.status(500).json({ ok: false, message: 'Error listando tiendas' });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Store.findByPk(req.params.id);
    if (!data) return res.status(404).json({ ok: false, message: 'Tienda no encontrada' });
    res.json({ ok: true, data });
  } catch (e) {
    console.error('stores.getById', e);
    res.status(500).json({ ok: false, message: 'Error obteniendo tienda' });
  }
};