'use strict';

module.exports = app => {
  app.beforeStart(async () => {
    // warning: 'force: true' will clean mysql data, for development/unittest only.
    await app.model.sync({
      force: [ 'local', 'unittest' ].includes(app.config.env),
    });
  });
};
