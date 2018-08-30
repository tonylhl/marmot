'use strict';

const defaultConfig = {
  username: 'root',
  password: 'marmot',
  database: 'marmot_development',
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || '3306',
  operatorsAliases: false,
  dialect: 'mysql',
};

module.exports = {
  development: defaultConfig,
  test: Object.assign({}, defaultConfig, {
    database: 'marmot_unittest',
  }),
  production: Object.assign({}, defaultConfig, {
    defaultConfig,
    database: 'marmot',
  }),
};