'use strict';

const get = require('lodash.get');
const moment = require('moment');
const crypto = require('crypto');

module.exports = {
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

