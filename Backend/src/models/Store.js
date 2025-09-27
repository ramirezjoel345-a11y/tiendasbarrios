// backend/src/models/Store.js
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ownerUserId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    slug: { type: DataTypes.STRING(140), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    photoUrl: { type: DataTypes.TEXT, allowNull: true },
    coverUrl: { type: DataTypes.TEXT, allowNull: true },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    addressLine: { type: DataTypes.STRING(180), allowNull: true },
    lat: { type: DataTypes.DECIMAL(10,7), allowNull: true },
    lng: { type: DataTypes.DECIMAL(10,7), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'stores',
    indexes: [{ unique: true, fields: ['slug'] }],
  });

  Store.associate = (models) => {
    Store.hasMany(models.StorePaymentMethod, { foreignKey: 'storeId', as: 'paymentMethods' });
    Store.hasMany(models.StoreRating, { foreignKey: 'storeId', as: 'ratings' });
    Store.hasMany(models.Conversation, { foreignKey: 'storeId', as: 'conversations' });
    Store.belongsTo(models.User, { foreignKey: 'ownerUserId', as: 'owner' });
  };

  return Store;
};
