'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const sinon = require('sinon');
const marmotRelease = require('marmot-release');

describe('test/app/controller/deploy.test.js', () => {

  let buildUniqId;

  beforeEach(async () => {
    const res = await app.model.Build.create({
      jobName: 'jobName',
      buildNumber: 'buildNumber-deploy-test',
      gitBranch: 'master',
      data: {
        packages: [
          {
            path: 'http://a.tgz',
          },
        ],
      },
    });
    buildUniqId = res.get('uniqId');
  });

  it('GET /api/deploy query deploy success', async () => {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    const { body: emptyDeployResult } = await app.httpRequest()
      .get('/api/deploy');
    assert.deepStrictEqual(emptyDeployResult, {
      message: '',
      success: true,
      data: {},
    });

    // deploy twice
    await app.httpRequest()
      .post('/api/deploy')
      .send({
        prefix: 'prefix-1st',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        buildUniqId,
        acl: 'default',
      });
    await app.httpRequest()
      .post('/api/deploy')
      .send({
        prefix: 'prefix-2nd',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        buildUniqId,
        acl: 'default',
      });
    // return latest deploy result
    const { body } = await app.httpRequest()
      .get(`/api/deploy?buildUniqId=${buildUniqId}`);
    assert(body.success);
    assert(body.message === '');
    assert(body.data.build.jobName === 'jobName');
    assert(body.data.build.buildNumber === 'buildNumber-deploy-test');
    assert(body.data.build.gitBranch === 'master');
    assert(body.data.build.uniqId === buildUniqId);
    assert(body.data.deploy.length === 1);
    assert(body.data.deploy[0].source === 'http://a.tgz');
    assert.deepStrictEqual(body.data.deploy[0].data, {
      html: [], other: [],
    });
  });

  it('GET /api/deploy/:uniqId success', async () => {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    const { body: deployRes } = await app.httpRequest()
      .post('/api/deploy')
      .send({
        prefix: 'prefix',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        buildUniqId,
        acl: 'default',
      });
    const { deployUniqId } = deployRes.data;
    assert(deployRes.success);
    assert(deployRes.message === '');
    assert(deployRes.data.deployUniqId);
    assert.deepStrictEqual(deployRes.data.html, []);
    assert.deepStrictEqual(deployRes.data.other, []);

    const { body } = await app.httpRequest()
      .get(`/api/deploy/${deployUniqId}`);
    assert(body.success);
    assert(body.message === '');
    assert.deepStrictEqual(body.data.deploy.data.html, []);
    assert.deepStrictEqual(body.data.deploy.data.other, []);
  });

  it('POST /api/deploy success', async () => {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    const { header, body } = await app.httpRequest()
      .post('/api/deploy')
      .send({
        prefix: 'prefix',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        acl: 'default',
        buildUniqId,
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    assert.deepStrictEqual(body.data.html, []);
    assert.deepStrictEqual(body.data.other, []);
  });

  it('POST /api/deploy validate error', async () => {
    const { header, body } = await app.httpRequest()
      .post('/api/deploy')
      .send({
        prefix: 'prefix',
        region: 'region',
        accessKeyId: null,
        accessKeySecret: null,
        bucket: 'bucket',
        acl: 'default',
        buildUniqId,
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(!body.succcess);
    assert(body.message === 'Validation Failed');
  });

});
