'use strict';
const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Chat extends Model {}
  Chat.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    isGroup: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, { sequelize, modelName: 'Chat', tableName: 'Chats' });
  return Chat;
};
