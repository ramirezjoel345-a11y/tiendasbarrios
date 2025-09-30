'use strict';
const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
  class Message extends Model {}
  Message.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    chatId: { type: DataTypes.STRING, allowNull: false },
    senderId: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'Messages',
    indexes: [
      { fields: ['chatId', 'createdAt'] }
    ]
  });
  return Message;
};
