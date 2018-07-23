'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1528180445670_8068';

  // add your config here
  config.middleware = [
    'cors', 'errorHandler',
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

  config.errorHandler = {
    match: '/api',
  };

  const marmotHost = process.env.MARMOT_HOST || '127.0.0.1';
  const marmotPort = process.env.MARMOT_PORT || '9900';
  const marmotViewHost = process.env.MARMOT_VIEW_HOST || 'npmcdn.com';
  const jenkinsHost = process.env.JENKINS_HOST || marmotHost;
  const staticHost = process.env.STATIC_HOST || marmotHost;
  const dataHubHost = process.env.DATAHUB_HOST || marmotHost;

  config.marmotView = {
    serverUrl: `//${marmotHost}:${marmotPort}`,
    assetsUrl: `//${marmotViewHost}/marmot-view@1`,
    jenkinsUrl: `//${jenkinsHost}:9910`,
    staticUrl: `//${staticHost}:9920`,
    datahubUrl: `//${dataHubHost}:9930`,
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
