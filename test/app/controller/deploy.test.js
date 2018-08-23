'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const sinon = require('sinon');
const marmotRelease = require('marmot-release');

describe('test/app/controller/deploy.test.js', () => {

  let buildId;

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
    buildId = res.get('uniqId');
  });

  it('GET /api/deploy/:buildUniqId success', async () => {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    await app.httpRequest()
      .post('/api/deploy')
      .send({
        prefix: 'prefix',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        buildId,
        acl: 'default',
      });
    const { header, body } = await app.httpRequest()
      .get(`/api/deploy?buildUniqId=${buildId}`);
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    assert.deepStrictEqual(body.build.deploy[0].data.html, []);
    assert.deepStrictEqual(body.build.deploy[0].data.other, []);
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
        buildId,
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
        buildId,
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(!body.succcess);
    assert(body.message === 'Validation Failed');
  });

});
