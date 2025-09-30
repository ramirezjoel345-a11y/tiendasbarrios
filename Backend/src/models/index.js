'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../../sequelize-config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./User')(sequelize, DataTypes);

module.exports = db;
