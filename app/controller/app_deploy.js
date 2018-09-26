'use strict';

const path = require('path');
const {
  Controller,
} = require('egg');

const DEPLOY_INIT = 'INIT';
const DEPLOY_SUCCESS = 'SUCCESS';
const DEPLOY_FAIL = 'FAIL';

module.exports = class AppDeployController extends Controller {
  // uniqId,
  // bucketTag,
  // type,
  async create() {
    const ctx = this.ctx;
    const {
      bucketTag,
      uniqId,
      type,
    } = ctx.request.body;
    ctx.validate({
      bucketTag: { type: 'string' },
      type: { type: 'string' },
      uniqId: { type: 'string' },
    });
    const credentialData = await ctx.model.Credential.findOne({
      where: {
        bucketTag,
      },
    });
    if (!credentialData) {
      ctx.fail('ERR_MARMOT_BUCKET_TAG_NOT_FOUND', `Bucket for ${bucketTag} not found.`);
      return;
    }
    const credential = await ctx.service.credential.queryDecryptedCredentialByUniqId({
      uniqId: credentialData.uniqId,
    });
    if (!credential.accessKeySecret) {
      ctx.fail('ERR_MARMOT_BUCKET_SECRETKEY_NOT_SET', `SecretKey for ${bucketTag} not set.`);
      return;
    }
    const build = await ctx.model.Build.findOne({
      where: {
        uniqId,
      },
    });
    if (!build) {
      ctx.fail('ERR_MARMOT_BUILD_RECORD_NOT_FOUND', `Build record for ${build} not found.`);
      return;
    }

    const {
      provider,
      namespace,
    } = credential;

    let prefix = ctx.request.body.prefix || '';
    prefix = path.normalize(path.join(prefix, namespace)).replace(/^[\.\/]+/, '');

    const source = await build.getReleasePath(type);

    if (!source) {
      ctx.fail('ERR_MARMOT_DEPLOY_TYPE_NOT_FOUND', `Release type '${type}' of build ${uniqId} not found.`);
      return;
    }
    let deploy;
    const transaction = await ctx.model.transaction();
    const acl = 'public-read';
    try {
      deploy = await ctx.model.Deploy.create({
        source,
        prefix,
        type,
        acl,
        data: {},
        state: DEPLOY_INIT,
      }, { transaction });
      await deploy.setBuild(build, {
        transaction,
      });
      const credentialRecord = await ctx.model.Credential.findOne({
        where: {
          uniqId: credential.uniqId,
        },
      });
      await deploy.setCredential(credentialRecord, {
        transaction,
      });
    } catch (err) {
      ctx.logger.error(err);
      await transaction.rollback();
      ctx.fail('ERR_MARMOT_DEPLOY_FAILED', err.message);
      return;
    }
    await transaction.commit();

    let uploadResult = {};
    let deployFail = false;
    let deployFailReason = '';
    switch (provider) {
      case 'ALIYUN_OSS': {
        const res = await ctx.service.deployAliyunOss.deploy({
          build,
          source,
          credential,
          prefix,
          acl,
        });
        if (!res.success) {
          deployFail = true;
          deployFailReason = res.message;
          break;
        }
        uploadResult = res.uploadResult;
        break;
      }
      case 'AMAZON_S3': {
        const res = await ctx.service.deployAmazonS3.deploy({
          build,
          source,
          credential,
          prefix,
          acl,
        });
        if (!res.success) {
          deployFail = true;
          deployFailReason = res.message;
          break;
        }
        uploadResult = res.uploadResult;
        break;
      }
      default: {
        deployFail = true;
        break;
      }
    }
    if (deployFail) {
      deploy.update({
        state: DEPLOY_FAIL,
      });
      ctx.fail('ERR_MARMOT_DEPLOY_FAILED', deployFailReason);
      return;
    }

    await deploy.update({
      data: uploadResult,
      state: DEPLOY_SUCCESS,
    });
    const url = ctx.app.safeGet(uploadResult, 'other[0].url');
    if (!url) {
      ctx.fail('ERR_MARMOT_DEPLOY_FAILED', 'Deploy failed: can\'t deploy resource.');
      return;
    }
    ctx.success({
      deployUniqId: deploy.uniqId,
      deploy: { package: { url } },
    });
  }
};
