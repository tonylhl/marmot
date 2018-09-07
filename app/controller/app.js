'use strict';

const {
  Controller,
} = require('egg');
const safeGet = require('lodash.get');

const DEFAULT_BRANCH_QUERY_DAYS_RANGE = 30;

class AppController extends Controller {
  async show() {
    const ctx = this.ctx;
    ctx.validate({
      bucketTag: { type: 'string' },
      type: { type: 'string' },
    }, ctx.query);

    const appId = ctx.params.appId;
    const { bucketTag, type } = ctx.query;
    const queryOptions = { type };
    const credential = await ctx.model.Credential.findOne({
      where: {
        bucketTag,
      },
    });
    if (!credential) {
      ctx.fail(`Deploy bucket for ${bucketTag} not found.`);
      return;
    }
    if (credential) queryOptions.credentialUniqId = credential.uniqId;

    const Op = ctx.app.Sequelize.Op;
    const branches = await ctx.model.Build.findAll({
      where: {
        appId,
        createdAt: {
          [Op.gte]: ctx.app.moment().subtract(DEFAULT_BRANCH_QUERY_DAYS_RANGE, 'days').toDate(),
        },
      },
      attributes: [ 'gitBranch', 'uniqId', 'createdAt' ],
      order: [[ 'createdAt', 'DESC' ]],
    });
    if (!branches.length) {
      ctx.fail(`Branches for ${appId} not found.`);
      return;
    }
    const uniqBranchMap = branches.reduce((map, branch) => {
      if (!(map.has(branch.gitBranch))) map.set(branch.gitBranch, branch.uniqId);
      return map;
    }, new Map());
    const buildUniqIds = Array.from(uniqBranchMap.values());

    const buildList = await ctx.model.Build.findAll({
      where: {
        uniqId: {
          [Op.in]: buildUniqIds,
        },
      },
      order: [
        [
          'createdAt',
          'DESC',
        ],
      ],
    });

    if (!buildList.length) {
      ctx.fail(`Build records for ${appId} not found.`);
      return;
    }

    const latestBuild = buildList[0];

    const builds = [];

    for (const build of buildList) {
      const data = build.get({ plain: true });
      const appBuildData = {
        uniqId: data.uniqId,
        version: safeGet(data, 'data.packages[0].version'),
        size: safeGet(data, 'data.packages[0].size'),
        gitBranch: data.gitBranch,
        gitCommitInfo: safeGet(data, 'data.gitCommitInfo'),
        testInfo: safeGet(data, 'data.testInfo'),
        deploy: null,
        createdAt: data.createdAt,
      };
      const deploys = await build.getDeploys({
        where: queryOptions,
        order: [
          [
            'createdAt',
            'DESC',
          ],
        ],
        limit: 1,
      });
      const url = ctx.app.safeGet(deploys, '[0].data.other[0].url');
      if (url) appBuildData.deploy = { package: { url } };
      builds.push(appBuildData);
    }

    ctx.success({
      appId: safeGet(latestBuild, 'data.extraInfo.appId'),
      gitRepo: safeGet(latestBuild, 'data.gitCommitInfo.gitUrl'),
      builds,
    });
  }
}

module.exports = AppController;
