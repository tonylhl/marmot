'use strict';

const {
  Controller,
} = require('egg');

class InsightController extends Controller {
  _fixedNumber(x) {
    return Number(Number.parseFloat(x).toFixed(2));
  }
  async ci() {
    const ctx = this.ctx;
    const { startDate = '', endDate = '', allBranches = 'Y' } = ctx.query;
    const allJobName = await ctx.model.JobName.findAll({
      attributes: [
        'jobName',
      ],
    }).map(i => i.jobName);

    const Op = ctx.app.Sequelize.Op;
    const result = await Promise.all(allJobName.map(async jobName => {
      const findOptions = {
        where: {
          jobName,
          state: 'SUCCESS',
        },
        attributes: [
          'jobName',
          'buildNumber',
          'gitBranch',
          'data',
          'createdAt',
          'finishedAt',
        ],
        order: [[ 'createdAt', 'DESC' ]],
      };
      if (allBranches === 'N') {
        findOptions.where.gitBranch = 'master';
      }
      if (startDate && endDate) {
        findOptions.where.createdAt = {
          [Op.gte]: ctx.app.moment(startDate).toDate(),
        };
        findOptions.where.finishedAt = {
          [Op.lte]: ctx.app.moment(endDate).toDate(),
        };
      }
      const res = await ctx.model.Build.findAll(findOptions);
      if (res.length === 0) return null;
      const committer = res[0].data.gitCommitInfo.committer.name;

      let linePercentCount = 0;
      let passTimeSumCount = 0;
      let durationCount = 0;
      const linePercentSum = res.reduce((value, i) => {
        if (i.data.testInfo.linePercent && !Number.isNaN(i.data.testInfo.linePercent)) {
          linePercentCount++;
          return i.data.testInfo.linePercent + value;
        }
        return value;
      }, 0);
      const passTimesSum = res.reduce((value, i) => {
        passTimeSumCount++;
        if (i.data.testInfo.passPercent === 100) {
          return 1 + value;
        }
        return value;
      }, 0);
      const durationSum = res.reduce((value, i) => {
        if (i.finishedAt - i.createdAt > 0) {
          durationCount++;
          return i.finishedAt - i.createdAt + value;
        }
        return value;
      }, 0);

      const linePercent = linePercentCount > 0 ? this._fixedNumber(linePercentSum / linePercentCount) : linePercentCount;
      const passPercent = passTimeSumCount > 0 ? this._fixedNumber(passTimesSum / passTimeSumCount * 100) : passTimeSumCount;
      const humanizeDuration = durationCount > 0
        ? ctx.app.moment.duration(durationSum / durationCount).humanize()
        : durationCount;

      return {
        jobName,
        linePercent,
        passPercent,
        committer,
        humanizeDuration,
      };
    }));

    this.ctx.body = {
      success: true,
      data: result.filter(i => i !== null),
    };
  }
}

module.exports = InsightController;
