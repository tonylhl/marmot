'use strict';

const {
  Controller,
} = require('egg');
const marmotRelease = require('marmot-release');
const OSS = require('ali-oss');

class DeployController extends Controller {
  async show() {
    const ctx = this.ctx;
    ctx.validate({ buildId: 'number' }, ctx.params);

    const buildId = ctx.params.buildId;
    const deploy = await ctx.model.Deploy.findOne({
      where: {
        buildId,
      },
    });

    ctx.body = {
      success: true,
      message: '',
      data: {
        html: deploy.getHtmlList(),
        other: deploy.getOtherList(),
      },
    };
  }

  async create() {
    const ctx = this.ctx;

    ctx.validate({
      region: { type: 'string' },
      accessKeyId: { type: 'string' },
      accessKeySecret: { type: 'string' },
      bucket: { type: 'string' },
      buildId: { type: 'number' },
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
    const build = await ctx.model.Build.findById(data.buildId);
    const source = await build.getReleasePath();

    ctx.logger.info('deploy start');

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

    ctx.logger.info('deploy end');

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
    } catch (err) {
      await transaction.rollback();
    }

    ctx.body = {
      success: true,
      message: '',
      data: {
        html,
        other,
      },
    };
  }
}

module.exports = DeployController;
