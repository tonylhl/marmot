'use strict';

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (e) {

      ctx.logger.error(e);

      const message = e.status === 500 && ctx.app.config.env === 'prod'
        ? 'Internal Server Error'
        : e.message;

      ctx.body = {
        success: false,
        message: `${message}`,
      };
    }
  };
};
