'use strict';

const { assert, app } = require('egg-mock/bootstrap');
const AWS = require('aws-sdk');
const sinon = require('sinon');
const marmotRelease = require('marmot-release');

describe('test/app/service/deploy_amazon_s3.test.js', () => {
  let ctx;

  beforeEach(async () => {
    ctx = app.mockContext();
  });

  it('deploy with accessKeySecretSaved', async () => {
    const stubAws = sinon.stub(AWS, 'S3').callsFake(function() {
      stubAws.restore();
      return { name: 'aws client' };
    });
    const stubMarmotRelease = sinon.stub(marmotRelease, 'uploadFile').callsFake(function() {
      stubMarmotRelease.restore();
      return Promise.resolve({
        url: 'http://amazomaws.com/a.zip',
      });
    });
    const { uniqId: credentialUniqId } = await ctx.service.credential.createCredential({
      provider: 'AMAZON_S3',
      bucketTag: 'tag1',
      region: 'region',
      bucket: 'bucket',
      namespace: 'namespace',
      accessKeyId: 'key',
      accessKeySecret: 'secret',
    });
    const build = await app.model.Build.create({
      jobName: 'jobName',
      buildNumber: 'buildNumber',
      gitBranch: 'gitBranch',
      data: {},
      uniqId: 'uniqId',
      appId: 'appId',
    });
    const credential = await ctx.service.credential.queryDecryptedCredentialByUniqId({
      uniqId: credentialUniqId,
    });
    const deployRes = await ctx.service.deployAmazonS3.deploy({
      build,
      source: 'http://github.com/a.zip',
      credential,
      prefix: 'prefix',
      acl: 'public-read',
    });
    assert.deepStrictEqual(deployRes, {
      success: true,
      message: '',
      uploadResult: {
        other: [
          {
            url: 'http://amazomaws.com/a.zip',
          },
        ],
      },
    });
  });

  it('deploy without accessKeySecretSaved', async () => {
    const stubAws = sinon.stub(AWS, 'S3').callsFake(function() {
      stubAws.restore();
      return { name: 'aws client' };
    });
    const stubMarmotRelease = sinon.stub(marmotRelease, 'uploadFile').callsFake(function() {
      stubMarmotRelease.restore();
      return Promise.resolve({
        url: 'http://amazomaws.com/a.zip',
      });
    });
    const { uniqId: credentialUniqId } = await ctx.service.credential.createCredential({
      provider: 'AMAZON_S3',
      bucketTag: 'tag1',
      region: 'region',
      bucket: 'bucket',
      namespace: 'namespace',
      accessKeyId: 'key',
      accessKeySecret: 'secret',
    });
    const build = await app.model.Build.create({
      jobName: 'jobName',
      buildNumber: 'buildNumber',
      gitBranch: 'gitBranch',
      data: {},
      uniqId: 'uniqId',
      appId: 'appId',
    });
    const credential = await ctx.service.credential.queryDecryptedCredentialByUniqId({
      uniqId: credentialUniqId,
    });
    const deployRes = await ctx.service.deployAmazonS3.deploy({
      build,
      source: 'http://github.com/a.zip',
      credential,
      accessKeySecretSaved: false,
      inputCredentialSecret: 'secret',
      prefix: 'prefix',
      acl: 'public-read',
    });
    assert.deepStrictEqual(deployRes, {
      success: true,
      message: '',
      uploadResult: {
        other: [
          {
            url: 'http://amazomaws.com/a.zip',
          },
        ],
      },
    });
  });
});
