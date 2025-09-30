'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Usa config de tu proyecto; aquí cargo config.json por simplicidad
let config;
try {
  config = require('../config')[env];
} catch {
  config = { url: process.env.DATABASE_URL, dialect: 'postgres', logging: false };
}

const sequelize = config.url
  ? new Sequelize(config.url, { logging: config.logging ?? false, dialect: 'postgres' })
  : new Sequelize(config.database, config.username, config.password, config);

const db = {};

fs.readdirSync(__dirname)
  .filter(f => f !== basename && f.endsWith('.js'))
  .forEach(f => {
    const model = require(path.join(__dirname, f))(sequelize);
    db[model.name] = model;
  });

// Asociaciones
const { User, StoreProfile, Chat, ChatParticipant, Message } = db;

if (User) {
  User.hasOne(StoreProfile, { as: 'storeProfile', foreignKey: 'userId' });
  StoreProfile.belongsTo(User, { as: 'owner', foreignKey: 'userId' });

  User.hasMany(ChatParticipant, { foreignKey: 'userId' });
  ChatParticipant.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Message, { as: 'messages', foreignKey: 'senderId' });
  Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
}

Chat.hasMany(ChatParticipant, { as: 'participants', foreignKey: 'chatId', onDelete: 'CASCADE' });
ChatParticipant.belongsTo(Chat, { foreignKey: 'chatId' });

Chat.hasMany(Message, { as: 'messages', foreignKey: 'chatId', onDelete: 'CASCADE' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
