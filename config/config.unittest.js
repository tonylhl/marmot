'use strict';

exports.sequelize = {
  dialect: 'mysql',
  database: 'marmot_unittest',
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || '3306',
  username: 'root',
  password: 'marmot',
};
