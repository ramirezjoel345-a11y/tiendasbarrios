// backend/src/controllers/payments.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listByStore = async (req, res) => {
  const data = await prisma.storePaymentMethod.findMany({ where: { storeId: req.params.storeId } });
  res.json({ ok: true, data });
};

exports.addForStore = async (req, res) => {
  try {
    const store = await prisma.store.findUnique({ where: { id: req.params.storeId } });
    if (!store) return res.status(404).json({ ok: false, message: 'Store not found' });
    if (store.ownerUserId !== req.user.id) return res.status(403).json({ ok: false, message: 'Forbidden' });

    const created = await prisma.storePaymentMethod.create({
      data: { storeId: store.id, type: req.body.type, isEnabled: !!req.body.isEnabled, details: req.body.details || {} }
    });
    res.status(201).json({ ok: true, data: created });
  } catch (e) {
    console.error('payments.addForStore', e);
    res.status(500).json({ ok: false, message: 'Error creando método de pago' });
  }
};

exports.update = async (req, res) => {
  const pm = await prisma.storePaymentMethod.findUnique({ where: { id: req.params.id }, include: { store: true } });
  if (!pm) return res.status(404).json({ ok: false, message: 'Payment not found' });
  if (pm.store.ownerUserId !== req.user.id) return res.status(403).json({ ok: false, message: 'Forbidden' });

  const upd = await prisma.storePaymentMethod.update({ where: { id: pm.id }, data: req.body });
  res.json({ ok: true, data: upd });
};

exports.remove = async (req, res) => {
  const pm = await prisma.storePaymentMethod.findUnique({ where: { id: req.params.id }, include: { store: true } });
  if (!pm) return res.status(404).json({ ok: false, message: 'Payment not found' });
  if (pm.store.ownerUserId !== req.user.id) return res.status(403).json({ ok: false, message: 'Forbidden' });

  await prisma.storePaymentMethod.delete({ where: { id: pm.id } });
  res.status(204).send();
};
