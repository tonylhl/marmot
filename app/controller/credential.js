'use strict';

const {
  Controller,
} = require('egg');

class CredentialController extends Controller {
  async index() {
    const ctx = this.ctx;
    const res = await ctx.service.credential.queryAllCredentials();
    ctx.success(res);
  }

  async show() {
    const ctx = this.ctx;
    const uniqId = ctx.params.uniqId;
    const res = await ctx.service.credential.queryCredentialByUniqId({ uniqId });
    ctx.success(res);
  }

  async create() {
    const ctx = this.ctx;

    ctx.validate({
      provider: { type: 'string' },
      bucketTag: { type: 'string', required: false },
      region: { type: 'string' },
      bucket: { type: 'string' },
      namespace: { type: 'string' },
      accessKeyId: { type: 'string' },
      accessKeySecret: { type: 'string' },
    });

    const {
      provider,
      bucketTag,
      region,
      bucket,
      namespace,
      accessKeyId,
      accessKeySecret,
    } = ctx.request.body;

    const credential = await ctx.service.credential.createCredential({
      provider,
      bucketTag,
      region,
      bucket,
      namespace,
      accessKeyId,
      accessKeySecret,
    });
    ctx.success(credential);
  }

  async update() {
    const ctx = this.ctx;
    const uniqId = ctx.params.uniqId;

    ctx.validate({
      accessKeyId: { type: 'string' },
      accessKeySecret: { type: 'string' },
    });

    const credential = await ctx.service.credential.updateCredential({
      uniqId,
      accessKeyId: ctx.request.body.accessKeyId,
      accessKeySecret: ctx.request.body.accessKeySecret,
    });
    ctx.success(credential);
  }

  async delete() {
    const ctx = this.ctx;
    const uniqId = ctx.params.uniqId;
    const res = await ctx.service.credential.deleteCredentialByUniqId({
      uniqId,
    });
    if (res > 0) {
      ctx.success(res);
      return;
    }
    ctx.fail();
  }
}

module.exports = CredentialController;
