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

  // config
  router.get('/api/config', controller.config.show);
  router.post('/api/config', controller.config.update);

  // deploy
  router.post('/api/deploy', controller.deploy.create);
  router.get('/api/deploy/:buildNumber', controller.deploy.show);

  // auth middleware
  router.get('/api/admin/status', controller.admin.status);
  router.get('/api/admin/build/delete/:uniqId', controller.admin.buildDelete);
  router.get('/api/admin/jobName/show', controller.admin.jobNameShow);
  router.get('/api/admin/jobName/delete/:uniqId', controller.admin.jobNameDalete);

  router.get('*', controller.home.index);
};
