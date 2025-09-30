'use strict';
const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class ChatParticipant extends Model {}
  ChatParticipant.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    chatId: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.STRING, allowNull: false },
    joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lastReadAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ChatParticipant',
    tableName: 'ChatParticipants',
    indexes: [{ unique: true, fields: ['chatId', 'userId'] }]
  });
  return ChatParticipant;
};
