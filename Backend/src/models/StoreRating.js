// backend/src/models/StoreRating.js
module.exports = (sequelize, DataTypes) => {
  const StoreRating = sequelize.define('StoreRating', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    storeId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT },
  }, {
    tableName: 'store_ratings',
    indexes: [{ unique: true, fields: ['storeId','userId'] }],
  });

  StoreRating.associate = (models) => {
    StoreRating.belongsTo(models.Store, { foreignKey: 'storeId', as: 'store' });
    StoreRating.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return StoreRating;
};
