'use strict';

const {
  Controller,
} = require('egg');
const marmotRelease = require('marmot-release');
const OSS = require('ali-oss');

class DeployController extends Controller {
  async index() {
    const ctx = this.ctx;
    // query by buildUniqId
    if (ctx.query.buildUniqId) {
      const buildUniqId = ctx.query.buildUniqId;
      const build = await ctx.model.Build.findOne({
        where: {
          uniqId: buildUniqId,
        },
        attributes: [
          'jobName',
          'buildNumber',
          'gitBranch',
          'createdAt',
          'uniqId',
        ],
      });
      const deploy = await build.getDeploy({
        limit: 1,
        order: [
          [
            'createdAt',
            'DESC',
          ],
        ],
      });
      ctx.success({
        build,
        deploy,
      });
      return;
    }
    ctx.success();
  }

  async show() {
    const ctx = this.ctx;
    ctx.validate({ uniqId: 'string' }, ctx.params);

    const uniqId = ctx.params.uniqId;
    console.log('show uniqId', {
      uniqId,
    });
    const deploy = await ctx.model.Deploy.findOne({
      where: {
        uniqId,
      },
      attributes: [
        'data',
        'uniqId',
        'createdAt',
      ],
    });

    ctx.success({ deploy });
  }

  async create() {
    const ctx = this.ctx;

    ctx.validate({
      region: { type: 'string' },
      accessKeyId: { type: 'string' },
      accessKeySecret: { type: 'string' },
      bucket: { type: 'string' },
      buildUniqId: { type: 'string' },
      acl: { type: 'string' },
      timeout: { type: 'string', required: false, allowEmpty: true },
      prefix: { type: 'string', allowEmpty: true },
    });

    const data = ctx.request.body;
    const acl = data.acl || 'default';
    const prefix = data.prefix || '';
    const region = data.region || '';
    const accessKeyId = data.accessKeyId;
    const accessKeySecret = data.accessKeySecret;
    const bucket = data.bucket || '';
    const timeout = Number(data.timeout) || 120 * 1000;
    const build = await ctx.model.Build.findOne({
      where: {
        uniqId: data.buildUniqId,
      },
    });

    const source = await build.getReleasePath();

    ctx.logger.info(`[start deploy] ${source}`);

    const ossClient = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      timeout,
      urllib: this.app.httpclient,
    });

    const [ html, other ] = await marmotRelease.uploadPackage({
      source,
      prefix,
      acl,
      ossClient,
    });

    ctx.logger.info(`[end deploy] ${source}`);

    let transaction;

    try {
      transaction = await ctx.model.transaction();
      const deploy = await ctx.model.Deploy.create({
        source,
        region,
        bucket,
        prefix,
        acl,
        active: true,
        data: { html, other },
      }, { transaction });
      await build.addDeploy(deploy, { transaction });
      await transaction.commit();
      ctx.success({
        deployUniqId: deploy.uniqId,
        html,
        other,
      });
    } catch (err) {
      /* istanbul ignore next */
      ctx.logger.error(err);
      /* istanbul ignore next */
      await transaction.rollback();
      /* istanbul ignore next */
      ctx.fail(err.message);
    }
  }
}

module.exports = DeployController;
