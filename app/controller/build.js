'use strict';

const {
  Controller,
} = require('egg');

const UPDATE_FIELDS = [
  'extendInfo',
];

class BuildController extends Controller {
  async show() {
    const ctx = this.ctx;
    const uniqId = ctx.params.uniqId;
    const res = await ctx.service.build.queryBuildByUniqId({
      uniqId,
    });
    ctx.success(res);
  }

  async query() {
    const ctx = this.ctx;
    const page = Number(ctx.query.page) || 1;
    const num = Number(ctx.query.num) || ctx.app.config.modelQueryConfig.pagination.num;

    const { jobName, buildNumber } = ctx.query;

    let res;
    if (jobName) {
      if (buildNumber) {
        res = await ctx.service.build.queryByJobNameAndBuildNumber({
          jobName,
          buildNumber,
        });
      } else {
        res = await ctx.service.build.queryByJobName({
          jobName,
          page, num,
        });
      }
    } else {
      res = await ctx.service.build.queryAllBuilds({ page, num });
    }

    if (res.success === false) {
      ctx.fail(res.code);
      return;
    }
    ctx.body = res;
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
      data: {
        allJobName,
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

  async update() {
    const ctx = this.ctx;
    const uniqId = ctx.params.uniqId;

    const requestData = ctx.request.body;
    const payload = {};
    for (const key of UPDATE_FIELDS) {
      if (!(key in requestData)) continue;
      payload[key] = requestData[key];
    }
    const queryRes = await ctx.service.build.queryBuildByUniqId({
      uniqId,
    });
    if (!queryRes) {
      ctx.fail('ERR_MARMOT_BUILD_RECORD_NOT_FOUND');
      return;
    }
    if (!Object.keys(payload).length) {
      ctx.fail('ERR_MARMOT_INVALID_PARAM_ERROR');
      return;
    }
    const res = await ctx.service.build.updateBuild({
      uniqId,
      payload,
    });
    const detailUrl = `http://${ctx.app.config.marmotView.marmotHost}/buildinfo?jobName=${queryRes.jobName}&buildNumber=${queryRes.buildNumber}`;
    await ctx.service.webhook.sendMarkdown({
      tag: 'release',
      title: 'Build info has changed',
      text: [
        `# ${queryRes.appId} build info changed`,
        `> Git branch: **${queryRes.gitBranch}**`,
        `> Operator: **${requestData.operator || '-'}**`,
        '> Details:',
        `\`\`\`json
${JSON.stringify(payload, null, 2)}
        \`\`\``,
        `[check detail now](${detailUrl})`,
      ],
    });
    ctx.success(res);
  }

  async patch() {
    const ctx = this.ctx;
    const uniqId = ctx.params.uniqId;

    const requestData = ctx.request.body;
    const currentData = await ctx.service.build.queryBuildByUniqId({
      uniqId,
    });
    if (!currentData) {
      ctx.fail('ERR_MARMOT_BUILD_RECORD_NOT_FOUND');
      return;
    }

    const payload = {};
    for (const key of UPDATE_FIELDS) {
      if (!(key in requestData)) continue;
      const currentValue = currentData[key];
      if (!currentValue) {
        payload[key] = requestData[key];
        continue;
      }
      if (Array.isArray(currentValue)) {
        payload[key] = [
          ...currentValue,
          ...requestData[key],
        ];
        continue;
      }
      if (typeof currentValue === 'object') {
        payload[key] = Object.assign({},
          currentValue,
          requestData[key]
        );
        continue;
      }
      payload[key] = requestData[key];
    }
    if (!Object.keys(payload).length) {
      ctx.fail('ERR_MARMOT_INVALID_PARAM_ERROR');
      return;
    }
    const res = await ctx.service.build.updateBuild({
      uniqId,
      payload,
    });
    ctx.success(res);
  }
}

module.exports = BuildController;
