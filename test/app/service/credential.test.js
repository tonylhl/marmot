'use strict';

const crypto = require('crypto');
const { assert, app } = require('egg-mock/bootstrap');

describe.only('test/app/service/credential.test.js', () => {
  let ctx;

  beforeEach(async () => {
    ctx = app.mockContext();
  });

  it('createCredential', async () => {
    const res = await ctx.service.credential.createCredential({
      provider: 'ALIYUN_OSS',
      bucketTag: 'tag1',
      region: 'region',
      bucket: 'bucket',
      namespace: 'namespace',
      accessKeyId: 'key',
      accessKeySecret: 'secret',
    });
    const encrypt = text => {
      const cipher = crypto.createCipher('aes-256-cbc', 'marmot-web_unittest_key');
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    };
    assert(res instanceof ctx.model.Credential);
    assert(res.accessKeyId === encrypt('key'));
    assert(res.accessKeySecret === encrypt('secret'));
  });

  it('queryAllCredentials', async () => {
    await ctx.service.credential.createCredential({
      provider: 'ALIYUN_OSS',
      bucketTag: 'tag1',
      region: 'region',
      bucket: 'bucket',
      namespace: 'namespace',
      accessKeyId: 'key',
      accessKeySecret: 'secret',
    });
    await app.delay(100);
    await ctx.service.credential.createCredential({
      provider: 'AMAZON_S3',
      bucketTag: 'tag2',
      region: 'region',
      bucket: 'bucket',
      namespace: 'namespace',
      accessKeyId: 'key2',
      accessKeySecret: 'secret2',
    });
    const res = await ctx.service.credential.queryAllCredentials();
    assert(res[0] instanceof ctx.model.Credential);
    assert(res[1] instanceof ctx.model.Credential);
    assert(res[0].provider === 'ALIYUN_OSS');
    assert(res[0].bucketTag === 'tag1');
    assert(res[0].region === 'region');
    assert(res[0].bucket === 'bucket');
    assert(res[0].namespace === 'namespace');
    assert.ifError(res[0].accessKeyId);
    assert.ifError(res[0].accessKeySecret);
    assert(res[1].provider === 'AMAZON_S3');
    assert(res[1].bucketTag === 'tag2');
    assert(res[1].region === 'region');
    assert(res[1].bucket === 'bucket');
    assert(res[1].namespace === 'namespace');
    assert.ifError(res[1].accessKeyId);
    assert.ifError(res[1].accessKeySecret);
  });
});
