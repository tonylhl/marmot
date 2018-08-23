'use strict';

const { app } = require('egg-mock/bootstrap');

before(async () => {
  await app.model.JobName.truncate();
  await app.model.Config.truncate();
  await app.model.Build.destroy({
    truncate: {
      cascade: true,
    }
  });
})

afterEach(async () => {
  await app.model.JobName.truncate();
  await app.model.Config.truncate();
  await app.model.Build.destroy({
    truncate: {
      cascade: true,
    }
  });
});
