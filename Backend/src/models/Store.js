// src/models/store.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:             { type: DataTypes.STRING(120), allowNull: false },
    description:      { type: DataTypes.TEXT },
    avatar_url:       { type: DataTypes.TEXT },

    // NUEVOS CAMPOS DE PERFIL
    welcome_message:  { type: DataTypes.TEXT },
    cover_url:        { type: DataTypes.TEXT },
    address:          { type: DataTypes.TEXT },
    lat:              { type: DataTypes.DECIMAL(9, 6) },
    lng:              { type: DataTypes.DECIMAL(9, 6) },
    open_time:        { type: DataTypes.TIME },
    close_time:       { type: DataTypes.TIME },
  }, {
    tableName: 'stores',
    underscored: true,
  });

  return Store;
};
