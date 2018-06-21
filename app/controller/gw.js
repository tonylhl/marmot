'use strict';

const {
  Controller,
} = require('egg');

class GwController extends Controller {
  async index() {
    const data = this.ctx.request.body;
    const jobName = data.environment.jenkins.JOB_NAME;
    const buildNumber = data.environment.jenkins.BUILD_NUMBER;
    await this.ctx.model.JobName.findOrCreate({
      where: {
        jobName,
      },
      defaults: {
        jobName,
      },
    });
    const createResult = await this.ctx.model.Build.create({
      buildNumber,
      jobName,
      data,
    });
    await this.ctx.service.webhook.push(data);
    this.ctx.body = {
      success: true,
      message: '',
      data: createResult,
    };
  }
}

module.exports = GwController;
