'use strict';

const path = require('path');
const AWS = require('aws-sdk');
const Service = require('egg').Service;
const marmotRelease = require('marmot-release');

module.exports = class deployAmazonS3 extends Service {

  async deploy({
    build,
    source,
    credential,
    accessKeySecretSaved,
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

    ctx.logger.info(`[deploy to s3 start] ${source}`);

    let success = true;
    let message = '';
    let uploadResult = {};
    let s3Client;

    try {
      AWS.config.update({
        accessKeyId,
        secretAccessKey: accessKeySecret, // aliyun to aws style
        region,
        httpOptions: {
          timeout: 20 * 1000,
        },
      });
      s3Client = new AWS.S3({
        apiVersion: '2006-03-01',
      });
    } catch (e) {
      ctx.logger.error(`[deploy to s3 fail] ${e}`);
      return {
        success: false,
        message: e.message,
      };
    }

    const extname = path.extname(source);

    if (extname === '.tgz') {
      try {
        const [ html, other ] = await marmotRelease.uploadPackage({
          client: s3Client,
          clientType: 'AMAZON_S3',
          bucket,
          source,
          prefix: '',
          acl,
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
      const extname = path.extname(source);

      try {
        const res = await marmotRelease.uploadFile({
          client: s3Client,
          clientType: 'AMAZON_S3',
          bucket,
          source,
          targetPath: fileStorageKey,
          extname,
          acl,
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
      ctx.logger.info(`[deploy to s3 end] ${source} ${JSON.stringify(uploadResult)}`);
    } else {
      ctx.logger.info(`[deploy to s3 fail] ${source} ${message}`);
    }
    return {
      success,
      message,
      uploadResult,
    };
  }
};

