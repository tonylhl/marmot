'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const path = require('path');
const util = require('util');
const process = require('process');

const accessKeyId = process.env.CI_ACCESSKEYID;
const accessKeySecret = process.env.CI_ACCESSKEYSECRET;

describe('test/app/controller/deploy.test.js', () => {

  it('POST /api/deploy/release success', function* () {
    const downloadDir = path.join(__dirname, '..', '..', 'fixtures', 'download-deploy-source');
    app.mockService('deploy', 'fetchSource', {
      downloadDir,
      downloadFile: path.join(downloadDir, 'deploy-sample.tgz'),
    });
    const { header, body } = yield app.httpRequest()
      .post('/api/deploy/release')
      .send({
        acl: 'public-read',
        prefix: 'promition',
        source: 'http://localhost/source.tgz',
        region: 'oss-cn-hangzhou',
        accessKeyId,
        accessKeySecret,
        bucket: 'test-upload-hangzhou',
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
        acl: 'public-read',
        prefix: 'promition',
        source: 'http://localhost/source.tgz',
        region: 'oss-cn-hangzhou',
        accessKeyId,
        accessKeySecret,
        bucket: '',
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(!body.succcess);
    assert(body.message === 'Validation Failed');
  });

});
