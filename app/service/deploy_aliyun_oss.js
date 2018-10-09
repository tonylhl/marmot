'use strict';

const path = require('path');
const OSS = require('ali-oss');
const proxy = require('proxy-agent');
const Service = require('egg').Service;
const debug = require('debug')('marmot:service:deploy_aliyun_oss');
const marmotRelease = require('marmot-release');

module.exports = class deployAliyunOssService extends Service {

  async deploy({
    build,
    source,
    credential,
    accessKeySecretSaved = true,
    inputCredentialSecret,
    prefix,
    acl,
  }) {
    const ctx = this.ctx;
    const {
      region,
      bucket,
      accessKeyId,
    } = credential;

    let accessKeySecret = credential.accessKeySecret;
    if (!accessKeySecretSaved) {
      accessKeySecret = inputCredentialSecret;
    }

    const timeout = ctx.app.config.marmotRelease.ALIYUN_OSS.timeout;

    ctx.logger.info(`[deploy to oss start] ${source}`);
    let success = true;
    let message = '';
    let uploadResult = {};
    let ossClient;
    const useDefaultAcl = ctx.app.config.marmotRelease.ALIYUN_OSS.useDefaultAcl;
    try {
      debug({
        source,
        accessKeySecretSaved,
        inputCredentialSecret,
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
        timeout,
        prefix,
        acl,
        useDefaultAcl,
      });
      if (useDefaultAcl) acl = 'default';
      const opts = {
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
        timeout,
      };
      if (ctx.app.config.marmotRelease.ALIYUN_OSS.proxyUri) {
        opts.agent = proxy(ctx.app.config.marmotRelease.ALIYUN_OSS.proxyUri);
      }
      ossClient = new OSS(opts);
    } catch (e) {
      ctx.logger.error(`[deploy to oss fail] ${e}`);
      return {
        success: false,
        message: e.message,
      };
    }
    if (path.extname(source) === '.tgz') {
      try {
        const [ html, other ] = await marmotRelease.uploadPackage({
          source,
          prefix: '',
          acl,
          client: ossClient,
        });
        uploadResult = {
          html,
          other,
        };
      } catch (e) {
        ctx.logger.error(e);
        message = e.message;
        success = false;
      }
    } else {
      const fileStorageKey = path.join(prefix, build.jobName, `${path.basename(source)}`);
      try {
        const res = await marmotRelease.uploadFile({
          client: ossClient,
          targetPath: fileStorageKey,
          source,
          acl,
          retryTimes: ctx.app.config.deployConfig.deployRetryTimes,
        });
        uploadResult = {
          other: [ res ],
        };
      } catch (e) {
        ctx.logger.error(e);
        message = e.message;
        success = false;
      }
    }

    if (success) {
      ctx.logger.info(`[deploy to oss end] ${source} ${JSON.stringify(uploadResult)}`);
    } else {
      ctx.logger.info(`[deploy to oss fail] ${message}`);
    }

    return {
      success,
      message,
      uploadResult,
    };
  }
};

