'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const path = require('path');
const sinon = require('sinon');
const marmotRelease = require('marmot-release');

describe('test/app/controller/deploy.test.js', () => {
  const source = path.join(__dirname, '..', '..', 'fixtures', 'download-deploy-source', 'deploy-sample.tgz');

  it('POST /api/deploy/release success', function* () {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    const { header, body } = yield app.httpRequest()
      .post('/api/deploy/release')
      .send({
        source,
        prefix: 'prefix',
        region: 'region',
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        acl: 'default',
        timeout: '30000',
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    assert.deepStrictEqual(body.data.html, []);
    assert.deepStrictEqual(body.data.other, []);
  });

  it('POST /api/deploy/release validate error', function* () {
    const { header, body } = yield app.httpRequest()
      .post('/api/deploy/release')
      .send({
        source,
        prefix: 'prefix',
        region: 'region',
        accessKeyId: null,
        accessKeySecret: null,
        bucket: 'bucket',
        acl: 'default',
        timeout: '30000',
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(!body.succcess);
    assert(body.message === 'Validation Failed');
  });

});
