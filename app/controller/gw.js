'use strict';

const {
  Controller,
} = require('egg');
const safeGet = require('lodash.get');
const debug = require('debug')('marmot:controller:gw');

class GwController extends Controller {
  async index() {
    const data = this.ctx.request.body;
    let jobName;
    let buildNumber;
    try {
      jobName = data.environment && data.environment.jenkins.JOB_NAME;
      buildNumber = data.environment && data.environment.jenkins.BUILD_NUMBER;
    } catch (_) {
      this.ctx.body = {
        success: false,
        message: 'environment.jenkins.JOB_NAME and environment.jenkins.BUILD_NUMBER are required',
      };
      return;
    }
    debug('jobName %s, buildNumber %s', jobName, buildNumber);
    await this.ctx.model.JobName.findOrCreate({
      where: {
        jobName,
      },
      defaults: {
        jobName,
      },
    });
    const appId = safeGet(data, 'extraInfo.appId') || '';
    const gitBranch = data.gitCommitInfo.gitBranch;
    const createResult = await this.ctx.model.Build.create({
      buildNumber,
      jobName,
      appId,
      gitBranch,
      data,
    });
    await this.ctx.service.webhook.push(data);
    this.ctx.success(createResult);
  }
}

module.exports = GwController;
