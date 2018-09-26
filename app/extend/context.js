'use strict';

const defaultErrorCode = 'ERR_MARMOT_INTERNAL_SERVER_ERROR';

module.exports = {
  success(data = {}) {
    this.body = {
      success: true,
      data,
    };
  },

  fail(errorCode = defaultErrorCode, message = '') {
    const errors = this.app.errors;
    if (!errors.has(errorCode)) {
      errorCode = defaultErrorCode;
    }
    const defaultMessage = errors.get(errorCode).message;
    this.body = {
      success: false,
      errorCode,
      message: message || defaultMessage,
    };
  },
};
