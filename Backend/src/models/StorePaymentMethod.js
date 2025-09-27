// backend/src/models/StorePaymentMethod.js
module.exports = (sequelize, DataTypes) => {
  const StorePaymentMethod = sequelize.define('StorePaymentMethod', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    storeId: { type: DataTypes.UUID, allowNull: false },
    type: { 
      type: DataTypes.ENUM('CASH','CARD','NEQUI','DAVIPLATA','BANCOLOMBIA','MERCADOPAGO','STRIPE'),
      allowNull: false
    },
    isEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    details: { type: DataTypes.JSONB, allowNull: true }, // {alias, phone, instructions, publicKey, etc.}
  }, { tableName: 'store_payment_methods' });

  StorePaymentMethod.associate = (models) => {
    StorePaymentMethod.belongsTo(models.Store, { foreignKey: 'storeId', as: 'store' });
  };

  return StorePaymentMethod;
};
