// backend/src/controllers/payments.controller.js
const { StorePaymentMethod, Store } = require('../models');

exports.listByStore = async (req, res) => {
  const data = await StorePaymentMethod.findAll({ where: { storeId: req.params.storeId } });
  res.json({ ok: true, data });
};

exports.addForStore = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.storeId);
    if (!store) return res.status(404).json({ ok: false, message: 'Store not found' });
    if (store.ownerUserId !== req.user.id) return res.status(403).json({ ok: false, message: 'Forbidden' });

    const created = await StorePaymentMethod.create({
      storeId: store.id,
      type: req.body.type,
      isEnabled: !!req.body.isEnabled,
      details: req.body.details || {}
    });
    res.status(201).json({ ok: true, data: created });
  } catch (e) {
    console.error('payments.addForStore', e);
    res.status(500).json({ ok: false, message: 'Error creando método de pago' });
  }
};

exports.update = async (req, res) => {
  const pm = await StorePaymentMethod.findByPk(req.params.id, { 
    include: { model: Store, as: 'store' } 
  });
  if (!pm) return res.status(404).json({ ok: false, message: 'Payment not found' });
  if (pm.store.ownerUserId !== req.user.id) return res.status(403).json({ ok: false, message: 'Forbidden' });

  await pm.update(req.body);
  res.json({ ok: true, data: pm });
};

exports.remove = async (req, res) => {
  const pm = await StorePaymentMethod.findByPk(req.params.id, { 
    include: { model: Store, as: 'store' } 
  });
  if (!pm) return res.status(404).json({ ok: false, message: 'Payment not found' });
  if (pm.store.ownerUserId !== req.user.id) return res.status(403).json({ ok: false, message: 'Forbidden' });

  await pm.destroy();
  res.status(204).send();
};