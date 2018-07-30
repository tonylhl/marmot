'use strict';

const {
  Controller,
} = require('egg');
const marmotRelease = require('marmot-release');
const OSS = require('ali-oss');

class DeployController extends Controller {
  async release() {
    const ctx = this.ctx;

    ctx.validate({
      region: { type: 'string' },
      accessKeyId: { type: 'string' },
      accessKeySecret: { type: 'string' },
      bucket: { type: 'string' },
      timeout: { type: 'string', required: false, allowEmpty: true },
      acl: { type: 'string' },
      prefix: { type: 'string', allowEmpty: true },
      source: { type: 'string', required: false, allowEmpty: true, format: /\.(tgz)$/ },
      sourceUrl: { type: 'string', required: false, allowEmpty: true },
    });

    const data = ctx.request.body;
    const acl = data.acl || 'default';
    const prefix = data.prefix || '';
    const source = data.source || '';
    const sourceUrl = data.sourceUrl || '';
    const region = data.region || '';
    const accessKeyId = data.accessKeyId;
    const accessKeySecret = data.accessKeySecret;
    const bucket = data.bucket || '';
    const timeout = Number(data.timeout) || 120 * 1000;

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
      sourceUrl,
      prefix,
      acl,
      ossClient,
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
