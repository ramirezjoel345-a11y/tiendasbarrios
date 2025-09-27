// backend/src/models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: { type: DataTypes.STRING(200), allowNull: false },
    role: {
      type: DataTypes.ENUM('VECINO', 'TENDERO', 'ADMIN'),
      allowNull: false,
      defaultValue: 'VECINO',
    },
  }, {
    tableName: 'users',
    indexes: [{ unique: true, fields: ['email'] }],
  });

  User.associate = (models) => {
    User.hasMany(models.Store, { foreignKey: 'ownerUserId', as: 'stores' });
    User.hasMany(models.StoreRating, { foreignKey: 'userId', as: 'ratings' });
    User.hasMany(models.Message, { foreignKey: 'senderUserId', as: 'messages' });
    User.hasMany(models.Conversation, { foreignKey: 'customerUserId', as: 'conversations' });
  };

  return User;
};