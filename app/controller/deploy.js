'use strict';

const path = require('path');
const {
  Controller,
} = require('egg');

const debug = require('debug')('marmot:controller:deploy');

const DEPLOY_INIT = 'INIT';
const DEPLOY_SUCCESS = 'SUCCESS';
const DEPLOY_FAIL = 'FAIL';

class DeployController extends Controller {
  async index() {
    const ctx = this.ctx;
    const findOptions = {};

    [ 'buildUniqId', 'type' ].forEach(i => {
      if (typeof ctx.query[i] !== 'undefined') { findOptions[i] = ctx.query[i]; }
    });

    const deploys = await ctx.model.Deploy.findAll({
      where: findOptions,
      order: [
        [
          'createdAt',
          'DESC',
        ],
      ],
      include: [{
        model: ctx.model.Credential,
        attributes: [ 'bucketTag', 'bucket', 'customDomain', 'customDomainProtocal' ],
      }],
    });

    ctx.success(deploys);
    return;
  }

  async show() {
    const ctx = this.ctx;
    ctx.validate({ uniqId: 'string' }, ctx.params);

    const uniqId = ctx.params.uniqId;
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
      type: { type: 'string' },
      buildUniqId: { type: 'string' },
      credentialSecret: { type: 'string' },
      credentialUniqId: { type: 'string' },
    });
    const {
      type,
      buildUniqId,
      credentialSecret,
      credentialUniqId,
    } = ctx.request.body;
    debug(ctx.request.body);

    const acl = 'public-read';
    const credential = await ctx.service.credential.queryDecryptedCredentialByUniqId({
      uniqId: credentialUniqId,
    });

    if (!credential) {
      ctx.fail('ERR_MARMOT_BUCKET_BY_UNIQID_NOT_FOUND');
      return;
    }

    // only if credentialSecret is saved
    const accessKeySecretSaved = credential.accessKeySecret !== '';
    if (accessKeySecretSaved && credentialSecret !== credential.accessKeySecret.substr(0, 6)) {
      ctx.fail('ERR_MARMOT_BUCKET_SECRET_INCORRECT');
      return;
    }

    const lastDeployed = await ctx.model.Deploy.findOne({
      where: {
        type,
        buildUniqId,
        credentialUniqId,
      },
    });
    if (lastDeployed && lastDeployed.state === DEPLOY_SUCCESS) {
      ctx.success({
        deployUniqId: lastDeployed.uniqId,
        uploadResult: lastDeployed.data,
      });
      return;
    }


    const {
      provider,
      namespace,
    } = credential;

    const prefix = path.normalize(namespace).replace(/^[\.\/]+/, '');

    const build = await ctx.model.Build.findOne({
      where: {
        uniqId: buildUniqId,
      },
    });

    const source = await build.getReleasePath(type);

    if (!source) {
      ctx.fail('ERR_MARMOT_DEPLOY_TYPE_NOT_FOUND');
      return;
    }

    let deploy;
    const transaction = await ctx.model.transaction();
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
          accessKeySecretSaved,
          inputCredentialSecret: credentialSecret,
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
          accessKeySecretSaved,
          inputCredentialSecret: credentialSecret,
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
    ctx.success({
      deployUniqId: deploy.uniqId,
      uploadResult,
    });
  }
}

module.exports = DeployController;
