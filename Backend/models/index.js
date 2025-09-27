const sequelize = require('../config/database');
const User = require('./User');
const Store = require('./Store');

// Relaciones
User.hasMany(Store, { foreignKey: 'ownerId', as: 'stores' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

module.exports = {
  sequelize,
  User,
  Store,
};
