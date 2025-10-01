'use strict';

module.exports = (sequelize, DataTypes) => {
  const StoreRating = sequelize.define('StoreRating', {
    id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    store_id: { type: DataTypes.UUID, allowNull: false },
    user_id:  { type: DataTypes.UUID, allowNull: false },
    score:    { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment:  { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'store_ratings',
    underscored: true,
  });

  return StoreRating;
};
