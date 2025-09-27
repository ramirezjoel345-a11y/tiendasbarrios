const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  address: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(40), allowNull: true },
  ownerId: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'stores',
  indexes: [{ fields: ['ownerId'] }],
});

module.exports = Store;
