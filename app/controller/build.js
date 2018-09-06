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
          'createdAt',
          'DESC',
        ],
      ],
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
          'createdAt',
          'DESC',
        ],
      ],
      where: {
        jobName,
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
    const ctx = this.ctx;
    const jobName = ctx.params.jobName;
    const buildNumber = ctx.params.buildNumber;
    const build = await ctx.model.Build.findOne({
      where: {
        jobName,
        buildNumber,
      },
    });
    if (!build) {
      ctx.fail();
      return;
    }

    const packages = ctx.app.safeGet(build, 'data.packages');
    const result = build.get({ plain: true });
    if (packages && packages.length) {
      await Promise.all(packages.map(async (v, i) => {
        const deploys = await build.getDeploys({
          where: {
            type: v.type,
          },
          order: [
            [
              'createdAt',
              'DESC',
            ],
          ],
        });
        result.data.packages[i].deploys = deploys;
      }));
    }

    ctx.success(result);
  }

  async queryAllLatest() {
    const allJobName = await this.ctx.model.JobName.findAll({
      attributes: [
        'jobName',
      ],
    }).map(i => i.jobName);

    const result = [];

    for (let i = 0; i < allJobName.length; i++) {
      const jobName = allJobName[i];
      const res = await this.ctx.model.Build.findOne({
        where: {
          jobName,
        },
        order: [
          [
            'createdAt',
            'DESC',
          ],
        ],
      });
      res && result.push(res);
    }
    this.ctx.body = {
      success: true,
      allJobName,
      data: {
        result,
      },
    };
  }

  async queryLatestByJobNameAndGitBranch() {
    const jobName = this.ctx.params.jobName;
    const gitBranch = this.ctx.params.gitBranch;
    const result = await this.ctx.model.Build.findAll({
      limit: 5,
      where: {
        jobName,
        gitBranch,
      },
      order: [
        [
          'createdAt',
          'DESC',
        ],
      ],
    });
    this.ctx.success({
      result,
    });
  }
}

module.exports = BuildController;
