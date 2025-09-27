// backend/src/models/Conversation.js
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    storeId: { type: DataTypes.UUID, allowNull: false },
    customerUserId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('OPEN','CLOSED'), defaultValue: 'OPEN' },
  }, {
    tableName: 'conversations',
    indexes: [{ unique: true, fields: ['storeId','customerUserId','status'] }],
  });

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.Store, { foreignKey: 'storeId', as: 'store' });
    Conversation.belongsTo(models.User, { foreignKey: 'customerUserId', as: 'customer' });
    Conversation.hasMany(models.Message, { foreignKey: 'conversationId', as: 'messages' });
  };

  return Conversation;
};
