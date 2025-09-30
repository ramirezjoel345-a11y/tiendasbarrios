'use strict';
const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class StoreProfile extends Model {}
  StoreProfile.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false, unique: true },
    displayName: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    avatarUrl: { type: DataTypes.STRING },
    coverUrl: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, { sequelize, modelName: 'StoreProfile', tableName: 'StoreProfiles' });
  return StoreProfile;
};
