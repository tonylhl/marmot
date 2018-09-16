'use strict';

const dbConfig = require('../database/config');

module.exports = appInfo => {
  const config = exports = {};

  config.siteFile = {
    '/favicon.ico': 'https://macacajs.github.io/marmot-logo/favicon.ico' };

  // use for cookie sign key, should change to your own and keep security
  config.keys = process.env.MARMOT_SECRET_KEY || appInfo.name + '_1528180445670_8068';

  // add your config here
  config.middleware = [
    'cors', 'errorHandler',
  ];

  config.httpclient = {
    request: {
      timeout: 20 * 1000,
    },
  };

  config.modelQueryConfig = {
    pagination: {
      // default num
      num: 10,
    },
  };

  config.errorHandler = {
    match: '/api',
  };

  const marmotHost = process.env.MARMOT_HOST || '127.0.0.1';
  const marmotViewHost = process.env.MARMOT_VIEW_HOST || 'unpkg.com';
  const jenkinsHost = process.env.JENKINS_HOST || marmotHost;
  const staticHost = process.env.STATIC_HOST || marmotHost;
  const dataHubHost = process.env.DATAHUB_HOST || marmotHost;

  config.marmotView = {
    serverUrl: '',
    assetsUrl: `//${marmotViewHost}/marmot-view@2`,
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

  config.sequelize = dbConfig.development;

  return config;
};
