'use strict';

const {
  Controller,
} = require('egg');
const safeGet = require('lodash.get');
const debug = require('debug')('marmot:controller:gw');

const {
  BUILD_STATE_INIT,
  BUILD_STATE_SUCCESS,
} = require('../constants/build');

class GwController extends Controller {
  async index() {
    const ctx = this.ctx;
    const { state = BUILD_STATE_SUCCESS, ...data } = ctx.request.body;
    // TODO remove
    const jobName = safeGet(data, 'environment.ci.JOB_NAME')
      || safeGet(data, 'environment.jenkins.JOB_NAME')
      || safeGet(data, 'environment.gitlab_ci.JOB_NAME');
    const buildNumber = safeGet(data, 'environment.ci.BUILD_NUMBER')
      || safeGet(data, 'environment.jenkins.BUILD_NUMBER')
      || safeGet(data, 'environment.gitlab_ci.BUILD_NUMBER');
    if (!jobName || !buildNumber) {
      ctx.fail('ERR_MARMOT_INVALID_PARAM_ERROR', 'environment.ci.JOB_NAME and environment.ci.BUILD_NUMBER are required.');
      return;
    }
    const gitBranch = safeGet(data, 'gitCommitInfo.gitBranch');
    if (!gitBranch) {
      ctx.fail('ERR_MARMOT_INVALID_PARAM_ERROR', 'gitCommitInfo.gitBranch is required.');
      return;
    }
    debug('jobName %s, buildNumber %s', jobName, buildNumber);
    await ctx.model.JobName.findOrCreate({
      where: {
        jobName,
      },
      defaults: {
        jobName,
      },
    });
    const appId = safeGet(data, 'extraInfo.appId') || '';

    let upsertResult = {};

    const build = await ctx.model.Build.findOne({
      where: {
        buildNumber,
        jobName,
      },
    });

    if (!build || state === BUILD_STATE_INIT) {
      debug('insert new build');
      upsertResult = await ctx.model.Build.create({
        buildNumber,
        jobName,
        appId,
        gitBranch,
        data,
        state,
      });
    } else {
      debug('update build', build.uniqId);
      upsertResult = await ctx.service.build.updateBuild({
        uniqId: build.uniqId,
        payload: {
          buildNumber,
          jobName,
          appId,
          gitBranch,
          data,
          state,
        },
      });
    }

    await ctx.service.webhook.pushBuildNotification(data);
    ctx.success(upsertResult);
  }
}

module.exports = GwController;
