'use strict';

exports.sequelize = {
  dialect: 'mysql',
  database: 'marmot',
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: '3306',
  username: 'root',
  password: 'marmot',
};
