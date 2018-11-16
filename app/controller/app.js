'use strict';

const {
  Controller,
} = require('egg');
const safeGet = require('lodash.get');
const querystring = require('querystring');
const debug = require('debug')('marmot:controller:app');

const { formatDeployUrl } = require('../common/formatter/deploy');

const DEFAULT_BRANCH_QUERY_DAYS_RANGE = 30;

class AppController extends Controller {
  async show() {
    const ctx = this.ctx;
    ctx.validate({
      bucketTag: { type: 'string' },
      type: { type: 'string' },
    }, ctx.query);
    debug(ctx.query);

    const appId = ctx.params.appId;
    const { bucketTag, type } = ctx.query;
    const queryOptions = { type };
    const credential = await ctx.model.Credential.findOne({
      where: {
        bucketTag,
      },
    });
    if (!credential) {
      ctx.fail('ERR_MARMOT_BUCKET_TAG_NOT_FOUND', `Bucket for ${bucketTag} not found.`);
      return;
    }
    debug(credential.dataValues);
    queryOptions.credentialUniqId = credential.uniqId;

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
      ctx.fail('ERR_MARMOT_BRANCH_RECORD_NOT_FOUND', `Branches for ${appId} not found.`);
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
      ctx.fail('ERR_MARMOT_BUILD_RECORD_NOT_FOUND', `Build records for ${appId} not found.`);
      return;
    }

    const latestBuild = buildList[0];

    const builds = [];

    for (const build of buildList) {
      const data = build.get({ plain: true });
      let size;
      const packages = safeGet(data, 'data.packages') || [];
      if (packages.length) {
        const pkg = packages.find(i => i.type === type);
        size = pkg && pkg.size;
      }
      const appBuildData = {
        uniqId: data.uniqId,
        version: safeGet(data, 'data.packages[0].version'),
        size,
        gitBranch: data.gitBranch,
        gitCommitInfo: safeGet(data, 'data.gitCommitInfo'),
        testInfo: safeGet(data, 'data.testInfo'),
        extendInfo: data.extendInfo || {},
        deploy: null,
        marmotDeployUrl: `http://${ctx.app.config.marmotView.marmotHost}/buildinfo?${querystring.stringify({
          jobName: data.jobName,
          buildNumber: data.buildNumber,
        })}`,
        state: data.state,
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
      const { customDomainProtocal, customDomain } = credential;
      let url = ctx.app.safeGet(deploys, '[0].data.other[0].url');
      if (url) {
        if (customDomainProtocal && customDomain) {
          url = formatDeployUrl({ url,
            customDomainOrigin: `${customDomainProtocal}${customDomain}`,
          });
        }
        appBuildData.deploy = { package: { url } };
      }
      debug(appBuildData);
      builds.push(appBuildData);
    }

    ctx.success({
      appId: latestBuild.appId,
      gitRepo: safeGet(latestBuild, 'data.gitCommitInfo.gitUrl'),
      builds,
    });
  }
}

module.exports = AppController;
