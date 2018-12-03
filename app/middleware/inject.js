'use strict';

const moment = require('moment');
const crypto = require('crypto');
const get = require('lodash.get');
const errors = require('../common/error');
const defaultErrorCode = 'ERR_MARMOT_INTERNAL_SERVER_ERROR';

module.exports = () => {
  return async function inject(ctx, next) {
    ctx.app.errors = errors;
    ctx.app.moment = moment;
    ctx.app.safeGet = get;
    ctx.app.toMd5 = string => {
      return crypto.createHash('md5')
        .update(string, 'utf8')
        .digest('hex');
    };
    ctx.app.delay = ms => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };
    ctx.success = (data = {}) => {
      ctx.body = {
        success: true,
        data,
      };
    };

    ctx.fail = (errorCode = defaultErrorCode, message = '') => {
      if (!errors.has(errorCode)) {
        errorCode = defaultErrorCode;
      }
      const defaultMessage = errors.get(errorCode).message;
      ctx.body = {
        success: false,
        errorCode,
        message: message || defaultMessage,
      };
    };
    await next();
  };
};
