const { app } = require('egg-mock/bootstrap');

const restore = async () => {
  await app.model.JobName.truncate();
  await app.model.Config.truncate();
  await app.model.Build.destroy({
    truncate: {
      cascade: true,
    }
  });
  await app.model.Credential.destroy({
    truncate: {
      cascade: true,
    }
  });
}
before(restore)
afterEach(restore);
