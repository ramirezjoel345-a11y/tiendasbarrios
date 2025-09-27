const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const modelDefiners = [
  require('./User'),
  require('./Store'),
  require('./StorePaymentMethod'),
  require('./StoreRating'),
  require('./Conversation'),
  require('./Message'),
];

const models = modelDefiners.reduce((acc, defineModel) => {
  const model = defineModel(sequelize, DataTypes);
  acc[model.name] = model;
  return acc;
}, {});

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};