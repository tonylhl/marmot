'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const sinon = require('sinon');
const marmotRelease = require('marmot-release');

describe('test/app/controller/deploy.test.js', () => {

  let buildId;

  before(async () => {
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
    buildId = res.get('id');
  });

  it.only('GET /api/deploy/:buildId success', async () => {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    await app.httpRequest()
      .post('/api/deploy')
      .send({
        buildNumber: 'buildNumber-deploy-test',
        prefix: 'prefix',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        acl: 'default',
      });
    const { header, body } = await app.httpRequest()
      .get(`/api/deploy/${buildId}`);
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    assert.deepStrictEqual(body.data.html, []);
    assert.deepStrictEqual(body.data.other, []);
  });

  it('POST /api/deploy success', function* () {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    const { header, body } = yield app.httpRequest()
      .post('/api/deploy')
      .send({
        buildNumber: 'buildNumber-deploy-test',
        prefix: 'prefix',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        acl: 'default',
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    assert.deepStrictEqual(body.data.html, []);
    assert.deepStrictEqual(body.data.other, []);
  });

  it('POST /api/deploy validate error', function* () {
    const { header, body } = yield app.httpRequest()
      .post('/api/deploy')
      .send({
        buildNumber: 'buildNumber-deploy-test',
        prefix: 'prefix',
        region: 'region',
        accessKeyId: null,
        accessKeySecret: null,
        bucket: 'bucket',
        acl: 'default',
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(!body.succcess);
    assert(body.message === 'Validation Failed');
  });

});
