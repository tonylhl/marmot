'use strict';

const {
  Controller,
} = require('egg');

class BuildController extends Controller {
  async queryAll() {
    const page = Number(this.ctx.query.page) || 1;
    const num = Number(this.ctx.query.num) || this.ctx.app.config.modelQueryConfig.pagination.num;
    const allJobName = await this.ctx.model.JobName.findAll({
      attributes: [
        'jobName',
      ],
    }).map(i => i.jobName);

    const result = await this.ctx.model.Build.findAndCountAll({
      limit: num,
      offset: (page - 1) * num,
      order: [
        [
          'created_at',
          'DESC',
        ],
      ],
      attributes: {
        exclude: this.ctx.app.config.modelQueryConfig.excludedAttributes,
      },
    });

    this.ctx.body = {
      success: true,
      message: '',
      allJobName,
      data: {
        total: result.count,
        page,
        result: result.rows,
      },
    };
  }

  async queryByJobName() {
    const page = Number(this.ctx.query.page) || 1;
    const num = Number(this.ctx.query.num) || this.ctx.app.config.modelQueryConfig.pagination.num;
    const allJobName = await this.ctx.model.JobName.findAll({
      attributes: [
        'jobName',
      ],
    }).map(i => i.jobName);
    const jobName = this.ctx.params.jobName;
    const result = await this.ctx.model.Build.findAndCountAll({
      limit: num,
      offset: (page - 1) * num,
      order: [
        [
          'created_at',
          'DESC',
        ],
      ],
      where: {
        jobName,
      },
      attributes: {
        exclude: this.ctx.app.config.modelQueryConfig.excludedAttributes,
      },
    });
    this.ctx.body = {
      success: true,
      message: '',
      allJobName,
      data: {
        total: result.count,
        page,
        result: result.rows,
      },
    };
  }

  async queryByJobNameAndBuildNumber() {
    const jobName = this.ctx.params.jobName;
    const buildNumber = this.ctx.params.buildNumber;
    const result = await this.ctx.model.Build.findOne({
      where: {
        jobName,
        buildNumber,
      },
      attributes: {
        exclude: this.ctx.app.config.modelQueryConfig.excludedAttributes,
      },
    });
    this.ctx.body = {
      success: !!result,
      message: '',
      data: {
        result,
      },
    };
  }
}

module.exports = BuildController;
