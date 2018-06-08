'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1528180445670_8068';

  // add your config here
  config.middleware = [
    'cors',
  ];

  config.modelQueryConfig = {
    pagination: {
      // default num
      num: 10,
    },
    excludedAttributes: [
      'id',
      'updated_at',
    ],
  };

  config.marmotView = {
    serverUrl: '//127.0.0.1:9900',
    assetsUrl: '//npmcdn.com/marmot-view@latest',
    jenkinsUrl: '//127.0.0.1:9910',
    staticUrl: '//127.0.0.1:9920',
    datahubUrl: '//127.0.0.1:9930',
  };

  config.security = {
    csrf: {
      enable: false,
    },
    methodnoallow: {
      enable: false,
    },
  };

  config.sequelize = {
    dialect: 'mysql',
    database: 'marmot_development',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: '3306',
    username: 'root',
    password: 'marmot',
  };

  return config;
};
