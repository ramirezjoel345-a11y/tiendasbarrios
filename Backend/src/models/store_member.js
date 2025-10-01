'use strict';

module.exports = (sequelize, DataTypes) => {
  const StoreMember = sequelize.define('StoreMember', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    store_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    role: { type: DataTypes.ENUM('OWNER', 'MEMBER'), allowNull: false, defaultValue: 'MEMBER' },
  }, {
    tableName: 'store_members',
    underscored: true,
  });

  return StoreMember;
};
