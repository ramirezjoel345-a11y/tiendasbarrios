const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(200), allowNull: false },
  role: { type: DataTypes.ENUM('owner', 'admin', 'staff'), allowNull: false, defaultValue: 'owner' },
}, {
  tableName: 'users',
  indexes: [{ unique: true, fields: ['email'] }],
});

module.exports = User;
