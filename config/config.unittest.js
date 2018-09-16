'use strict';

const dbConfig = require('../database/config');

module.exports = appInfo => {
  const config = exports = {};

  config.sequelize = dbConfig.test;
  config.keys = process.env.MARMOT_SECRET_KEY || appInfo.name + '_unittest_key';
  return config;
};
