'use strict';

const get = require('lodash.get');
const crypto = require('crypto');

module.exports = {
  get safeGet() {
    return get;
  },

  toMd5(string) {
    return crypto.createHash('md5')
      .update(string, 'utf8')
      .digest('hex');
  },
};

