'use strict';

module.exports = {
  development: {
    username: 'root',
    password: 'marmot',
    database: 'marmot_development',
    host: '127.0.0.1',
    operatorsAliases: false,
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: 'marmot',
    database: 'marmot_unittest',
    host: '127.0.0.1',
    operatorsAliases: false,
    dialect: 'mysql',
  },
  production: {
    dialect: 'mysql',
    database: 'marmot_development',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || '3306',
    username: 'root',
    password: 'marmot',
    operatorsAliases: false,
  },
};
