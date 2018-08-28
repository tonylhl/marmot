'use strict';

module.exports = {
  success(data = {}) {
    this.body = {
      success: true,
      message: '',
      data,
    };
  },

  /* istanbul ignore next */
  fail(message = '', data = {}) {
    this.body = {
      success: false,
      message,
      data,
    };
  },
};
