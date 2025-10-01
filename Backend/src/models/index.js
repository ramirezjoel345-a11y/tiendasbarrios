'use strict';
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,
    define: { underscored: true }
  }
);

// modelos
const User         = require('./user')(sequelize, DataTypes);
const Store        = require('./store')(sequelize, DataTypes);
const StoreMember  = require('./store_member')(sequelize, DataTypes);
const Message      = require('./message')(sequelize, DataTypes);
const StoreRating  = require('./store_rating')(sequelize, DataTypes);

// asociaciones
Store.hasMany(StoreMember, { as: 'members',  foreignKey: 'store_id' });
StoreMember.belongsTo(Store,{ as: 'store',   foreignKey: 'store_id' });

User.hasMany(StoreMember,  { as: 'storeMemberships', foreignKey: 'user_id' });
StoreMember.belongsTo(User,{ as: 'user',    foreignKey: 'user_id' });

Store.hasMany(Message,     { as: 'messages', foreignKey: 'store_id' });
Message.belongsTo(Store,   { as: 'store',    foreignKey: 'store_id' });

User.hasMany(Message,      { as: 'messages', foreignKey: 'user_id' });
Message.belongsTo(User,    { as: 'author',   foreignKey: 'user_id' });

// ratings
Store.hasMany(StoreRating, { as: 'ratings',  foreignKey: 'store_id' });
StoreRating.belongsTo(Store,{ as: 'store',   foreignKey: 'store_id' });

User.hasMany(StoreRating,  { as: 'ratings',  foreignKey: 'user_id' });
StoreRating.belongsTo(User,{ as: 'user',     foreignKey: 'user_id' });

module.exports = { sequelize, Sequelize, User, Store, StoreMember, Message, StoreRating };
