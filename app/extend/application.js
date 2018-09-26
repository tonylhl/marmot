'use strict';

const moment = require('moment');
const crypto = require('crypto');
const get = require('lodash.get');
const errors = require('../common/error');

module.exports = {
  get errors() {
    return errors;
  },

  get moment() {
    return moment;
  },

  get safeGet() {
    return get;
  },

  toMd5(string) {
    return crypto.createHash('md5')
      .update(string, 'utf8')
      .digest('hex');
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

