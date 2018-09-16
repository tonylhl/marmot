'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const {
    router,
    controller,
  } = app;

  router.post('/api/gw', controller.gw.index);

  // build
  router.get('/api/build', controller.build.queryAll);
  router.get('/api/build/:jobName', controller.build.queryByJobName);
  router.get('/api/build/:jobName/:buildNumber', controller.build.queryByJobNameAndBuildNumber);
  router.get('/api/latestBuild', controller.build.queryAllLatest);
  router.get('/api/latestBuild/:jobName/:gitBranch+', controller.build.queryLatestByJobNameAndGitBranch);

  router.put('/api/build/:uniqId', controller.build.update);
  router.patch('/api/build/:uniqId', controller.build.patch);

  // config
  router.get('/api/config', controller.config.show);
  router.post('/api/config', controller.config.update);

  // deploy
  router.get('/api/deploy', controller.deploy.index);
  router.post('/api/deploy', controller.deploy.create);
  router.get('/api/deploy/:uniqId', controller.deploy.show);

  // apps
  router.get('/api/app/:appId', controller.app.show);
  router.post('/api/appDeploy', controller.appDeploy.create);

  // credential
  router.get('/api/credential', controller.credential.index);
  router.post('/api/credential', controller.credential.create);
  router.get('/api/credential/:uniqId', controller.credential.show);
  router.put('/api/credential/:uniqId', controller.credential.update);
  router.delete('/api/credential/:uniqId', controller.credential.delete);

  // delegate
  router.post('/api/delegate/message', controller.delegate.message);

  router.get('*', controller.home.index);
};
