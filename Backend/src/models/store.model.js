const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Store = sequelize.define('Store', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  address: { type: DataTypes.STRING(200), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'stores',
  timestamps: true
});

module.exports = Store;
