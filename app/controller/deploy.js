'use strict';

const {
  Controller,
} = require('egg');
const marmotRelease = require('marmot-release');
const AgentKeepalive = require('agentkeepalive');
const OSS = require('ali-oss');

class DeployController extends Controller {
  async release() {
    const ctx = this.ctx;

    ctx.validate({
      region: { type: 'string' },
      accessKeyId: { type: 'string' },
      accessKeySecret: { type: 'string' },
      bucket: { type: 'string' },
      timeout: { type: 'number', required: false },
      acl: { type: 'string' },
      prefix: { type: 'string', allowEmpty: true },
      source: { type: 'string', required: false, format: /\.(tgz)$/ },
      sourceUrl: { type: 'string', required: false },
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
    const timeout = data.timeout || 120 * 1000;

    ctx.logger.info('deploy start');

    const urllib = require('urllib').create({
      agent: new AgentKeepalive({
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 30000,
        freeSocketKeepAliveTimeout: 15000, // free socket keepalive for 30 seconds
      }),
    });

    const ossClient = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      timeout,
      urllib,
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
