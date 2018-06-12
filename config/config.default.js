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

  const marmotHost = process.env.MARMOT_HOST || '127.0.0.1';

  config.marmotView = {
    serverUrl: `//${marmotHost}:9900`,
    assetsUrl: '//npmcdn.com/marmot-view@latest',
    jenkinsUrl: `//${marmotHost}:9910`,
    staticUrl: `//${marmotHost}:9920`,
    datahubUrl: `//${marmotHost}:9930`,
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
    port: process.env.MYSQL_PORT || '3306',
    username: 'root',
    password: 'marmot',
    operatorsAliases: false,
  };

  return config;
};
