'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const util = require('util');
const process = require('process');
const path = require('path');

const accessKeyId = process.env.CI_ACCESSKEYID;
const accessKeySecret = process.env.CI_ACCESSKEYSECRET;

describe('test/app/controller/deploy.test.js', () => {
  const source = path.join(__dirname, '..', '..', 'fixtures', 'download-deploy-source', 'deploy-sample.tgz');

  it('POST /api/deploy/release success', function* () {
    const { header, body } = yield app.httpRequest()
      .post('/api/deploy/release')
      .send({
        source,
        prefix: 'promition',
        region: 'oss-cn-hangzhou',
        accessKeyId,
        accessKeySecret,
        bucket: 'test-upload-hangzhou',
        acl: 'public-read',
        timeout: 120000,
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    assert(util.isArray(body.data.html) === true);
    assert(util.isArray(body.data.other) === true);
    assert(body.data.html[0].success === true);
  });

  it('POST /api/deploy/release validate error', function* () {
    const { header, body } = yield app.httpRequest()
      .post('/api/deploy/release')
      .send({
        source,
        prefix: 'promition',
        region: 'oss-cn-hangzhou',
        accessKeyId,
        accessKeySecret,
        acl: 'public-read',
        bucket: 'test-upload-hangzhou',
        timeout: 'marmot',
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(!body.succcess);
    assert(body.message === 'Validation Failed');
  });

});
