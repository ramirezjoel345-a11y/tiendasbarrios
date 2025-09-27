// backend/src/controllers/stores.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
  try {
    const ownerUserId = req.user.id;
    const { name, slug, description, photoUrl, coverUrl, phone, addressLine, lat, lng } = req.body;

    const store = await prisma.store.create({
      data: { name, slug, description, photoUrl, coverUrl, phone, addressLine, lat, lng, ownerUserId }
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
    const data = await prisma.store.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
      orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, data });
  } catch (e) {
    console.error('stores.list', e);
    res.status(500).json({ ok: false, message: 'Error listando tiendas' });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await prisma.store.findUnique({ where: { id: req.params.id } });
    if (!data) return res.status(404).json({ ok: false, message: 'Tienda no encontrada' });
    res.json({ ok: true, data });
  } catch (e) {
    console.error('stores.getById', e);
    res.status(500).json({ ok: false, message: 'Error obteniendo tienda' });
  }
};
