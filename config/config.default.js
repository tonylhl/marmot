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

  let deployRetryTimes = isNaN(process.env.MARMOT_DEPLOY_RETRY_TIMES) ? 3 : Number(process.env.MARMOT_DEPLOY_RETRY_TIMES);
  if (deployRetryTimes > 10) deployRetryTimes = 10;
  config.deployConfig = {
    deployRetryTimes,
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
  const marmotViewVersion = process.env.MARMOT_VIEW_VERSION || 2;
  const jenkinsHost = process.env.JENKINS_HOST || marmotHost;
  const staticHost = process.env.STATIC_HOST || marmotHost;
  const dataHubHost = process.env.DATAHUB_HOST || marmotHost;

  config.marmotView = {
    serverUrl: '',
    marmotHost,
    assetsUrl: `//${marmotViewHost}/marmot-view@${marmotViewVersion}`,
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

  config.marmotRelease = {
    AMAZON_S3: {
      sslDisabled: process.env.AWS_DISABLE_SSL || false,
      // proxyUri: 'http://ip:host';
      proxyUri: process.env.AWS_PROXY_URI || null,
    },
    ALIYUN_OSS: {
      useDefaultAcl: process.env.ALIYUN_USE_DEFAULT_ACL || false,
      // proxyUri: 'http://ip:host';
      proxyUri: process.env.ALIYUN_PROXY_URI || null,
      timeout: process.env.ALIYUN_TIMEOUT || 60 * 1000,
    },
  };

  config.sequelize = dbConfig.development;

  return config;
};
