// backend/src/models/Message.js
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversationId: { type: DataTypes.UUID, allowNull: false },
    senderType: { type: DataTypes.ENUM('USER','STORE','ADMIN'), allowNull: false },
    senderUserId: { type: DataTypes.UUID, allowNull: true }, // null si lo envía el perfil de tienda (panel)
    body: { type: DataTypes.TEXT, allowNull: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: 'messages' });

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, { foreignKey: 'conversationId', as: 'conversation' });
    Message.belongsTo(models.User, { foreignKey: 'senderUserId', as: 'senderUser' });
  };

  return Message;
};
