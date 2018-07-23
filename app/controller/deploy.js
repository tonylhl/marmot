'use strict';

const {
  Controller,
} = require('egg');

class DeployController extends Controller {
  async release() {
    const ctx = this.ctx;

    ctx.validate({
      acl: { type: 'string', required: true },
      prefix: { type: 'string', allowEmpty: true },
      source: { type: 'string', requeied: true, format: /\.(tgz)$/ },
      region: { type: 'string', required: true },
      accessKeyId: { type: 'string', required: true },
      accessKeySecret: { type: 'string', required: true },
      bucket: { type: 'string', required: true },
    });

    const data = ctx.request.body;
    const acl = data.acl || 'default';
    const prefix = data.prefix || '';
    const sourceUrl = data.source;
    const region = data.region;
    const accessKeyId = data.accessKeyId;
    const accessKeySecret = data.accessKeySecret;
    const bucket = data.bucket;

    ctx.logger.info('deploy start');

    const [ html, other ] = await ctx.service.deploy.uploadPackage({
      sourceUrl,
      prefix,
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      acl,
    });

    ctx.logger.info('deploy end');

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
