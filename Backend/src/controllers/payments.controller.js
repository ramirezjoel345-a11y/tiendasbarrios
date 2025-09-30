const { Store, StorePaymentMethod } = require('../models');

exports.upsertForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { methods } = req.body;

    if (!storeId) {
      return res.status(422).json({ ok: false, error: 'storeId requerido en la URL' });
    }
    if (!Array.isArray(methods)) {
      return res.status(422).json({ ok: false, error: 'methods debe ser un array' });
    }

    const exists = await Store.findByPk(storeId);
    if (!exists) return res.status(404).json({ ok: false, error: 'Store not found' });

    const rows = methods.map((m, idx) => {
      if (!m || !m.method) {
        throw new Error(`methods[${idx}].method es requerido`);
      }
      return {
        storeId,
        type: String(m.method).toUpperCase(),   // 👈 columna real = type
        enabled: typeof m.enabled === 'boolean' ? m.enabled : true,
        details: m.details ?? {}
      };
    });

    // Reemplazar todos
    await StorePaymentMethod.destroy({ where: { storeId } });
    const created = await StorePaymentMethod.bulkCreate(rows, { returning: true });

    return res.json({ ok: true, data: created });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
};

exports.listForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!storeId) {
      return res.status(422).json({ ok: false, error: 'storeId requerido en la URL' });
    }

    const data = await StorePaymentMethod.findAll({
      where: { storeId },
      order: [['createdAt', 'ASC']]
    });

    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
