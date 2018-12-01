'use strict';

const {
  Controller,
} = require('egg');

class InsightController extends Controller {
  _fixedNumber(x) {
    return Number(Number.parseFloat(x).toFixed(2));
  }

  _getCommitUrl(record) {
    const ctx = this.ctx;
    const gitUrl = ctx.app.safeGet(record, 'data.gitCommitInfo.gitUrl');
    const shortHash = ctx.app.safeGet(record, 'data.gitCommitInfo.shortHash');
    return (gitUrl && shortHash) ? `${gitUrl}/commit/${shortHash}` : null;
  }

  _normalizeCoverageUrl(record) {
    const ctx = this.ctx;
    const path = ctx.app.safeGet(record, 'data.testInfo.coverageHtmlReporterPath');
    return this._normalizeResourceUrl(record.data, path);
  }
  _normalizeReporterUrl(record) {
    const ctx = this.ctx;
    const path = ctx.app.safeGet(record, 'data.testInfo.testHtmlReporterPath');
    return this._normalizeResourceUrl(record.data, path);
  }
  _normalizeResourceUrl(data, target) {
    // for old version marmot cleint
    const ctx = this.ctx;
    const safeGet = ctx.app.safeGet;
    const jobName = safeGet(data, 'environment.ci.JOB_NAME') ||
    safeGet(data, 'environment.jenkins.JOB_NAME');
    const buildNumber = safeGet(data, 'environment.ci.BUILD_NUMBER') ||
    safeGet(data, 'environment.jenkins.BUILD_NUMBER');
    const staticUrl = `${ctx.app.config.marmotView.staticUrl}/jenkins/${jobName}/${buildNumber}`;

    if (!target) {
      return '';
    }

    if (target.startsWith('http://') || target.startsWith('https://')) {
      return target;
    }
    return `${staticUrl}/${target}`;
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
        limit: 100,
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

      const lastCommit = {
        committer: ctx.app.safeGet(res, '[0].data.gitCommitInfo.committer.name'),
        shortHash: ctx.app.safeGet(res, '[0].data.gitCommitInfo.shortHash'),
        commitUrl: this._getCommitUrl(res[0]),
      };

      let linePercentCount = 0;
      let passTimeSumCount = 0;
      let durationCount = 0;

      const linePercentList = [];
      const passPercentList = [];
      const durationList = [];

      const linePercentSum = res.reduce((value, i) => {
        if (i.data.testInfo.linePercent && !Number.isNaN(i.data.testInfo.linePercent)) {
          linePercentCount++;
          linePercentList.push({
            commitUrl: this._getCommitUrl(i),
            shortHash: ctx.app.safeGet(i, 'data.gitCommitInfo.shortHash'),
            coverageUrl: this._normalizeCoverageUrl(i),
            linePercent: ctx.app.safeGet(i, 'data.testInfo.linePercent'),
            createdAt: ctx.app.moment(i.createdAt).fromNow(),
          });
          return i.data.testInfo.linePercent + value;
        }
        return value;
      }, 0);
      const passTimesSum = res.reduce((value, i) => {
        passTimeSumCount++;
        passPercentList.push({
          commitUrl: this._getCommitUrl(i),
          shortHash: ctx.app.safeGet(i, 'data.gitCommitInfo.shortHash'),
          reporterUrl: this._normalizeReporterUrl(i),
          passPercent: ctx.app.safeGet(i, 'data.testInfo.passPercent'),
          createdAt: ctx.app.moment(i.createdAt).fromNow(),
        });
        if (i.data.testInfo.passPercent === 100) {
          return 1 + value;
        }
        return value;
      }, 0);
      const durationSum = res.reduce((value, i) => {
        if (i.finishedAt - i.createdAt > 0) {
          durationCount++;
          durationList.push({
            commitUrl: this._getCommitUrl(i),
            shortHash: ctx.app.safeGet(i, 'data.gitCommitInfo.shortHash'),
            duration: ctx.app.moment.duration(i.finishedAt - i.createdAt).humanize(),
            createdAt: ctx.app.moment(i.createdAt).fromNow(),
          });
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
        lastCommit,
        humanizeDuration,
        linePercentList,
        passPercentList,
        durationList,
      };
    }));

    this.ctx.body = {
      success: true,
      data: result.filter(i => i !== null),
    };
  }
}

module.exports = InsightController;
