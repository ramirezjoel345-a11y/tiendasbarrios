const Store = require('../models/store.model');

exports.list = async (req, res) => {
  const rows = await Store.findAll({ order: [['id', 'ASC']] });
  res.json(rows);
};

exports.get = async (req, res) => {
  const row = await Store.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Store not found' });
  res.json(row);
};

exports.create = async (req, res) => {
  const { name, description, phone, address, isActive } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const row = await Store.create({ name, description, phone, address, isActive });
  res.status(201).json(row);
};

exports.update = async (req, res) => {
  const row = await Store.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Store not found' });
  const { name, description, phone, address, isActive } = req.body;
  await row.update({ name, description, phone, address, isActive });
  res.json(row);
};

exports.remove = async (req, res) => {
  const row = await Store.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: 'Store not found' });
  await row.destroy();
  res.status(204).end();
};
