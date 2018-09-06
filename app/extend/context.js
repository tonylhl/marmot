'use strict';

module.exports = {
  success(data = {}, message = '') {
    this.body = {
      success: true,
      message,
      data,
    };
  },

  /* istanbul ignore next */
  fail(message = '') {
    this.body = {
      success: false,
      message,
    };
  },
};
