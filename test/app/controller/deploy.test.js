'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const sinon = require('sinon');
const marmotRelease = require('marmot-release');

describe('test/app/controller/deploy.test.js', () => {

  let buildUniqId;
  let credentialUniqId;

  beforeEach(async () => {
    let res = await app.model.Build.create({
      jobName: 'jobName',
      buildNumber: 'buildNumber-deploy-test',
      gitBranch: 'master',
      data: {
        packages: [
          {
            path: 'http://a.tgz',
            size: '200',
            type: 'dev',
          },
        ],
      },
    });
    buildUniqId = res.get('uniqId');

    res = await app.model.Credential.create({
      provider: 'ALIYUN_OSS',
      bucketTag: 'dev',
      region: 'region',
      bucket: 'bucket',
      namespace: 'namespace',
      accessKeyId: 'accessKeyId',
      accessKeySecret: 'accessKeySecret',
    });
    credentialUniqId = res.get('uniqId');
    app.mockService('credential', 'decrypt', function() {
      return 'thekey-therest';
    });
  });

  it('GET /api/deploy query deploy success', async () => {
    let stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    const { body: emptyDeployResult } = await app.httpRequest()
      .get('/api/deploy');
    assert.deepStrictEqual(emptyDeployResult, {
      success: true,
      data: [],
    });

    // deploy twice
    await app.httpRequest()
      .post('/api/deploy')
      .send({
        type: 'dev',
        buildUniqId,
        credentialSecret: 'thekey',
        credentialUniqId,
      });
    stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    await app.httpRequest()
      .post('/api/deploy')
      .send({
        type: 'dev',
        buildUniqId,
        credentialSecret: 'thekey',
        credentialUniqId,
      });
    // return double deploy result
    const { body } = await app.httpRequest()
      .get(`/api/deploy?buildUniqId=${buildUniqId}`);
    assert(body.success);
    for (const record of body.data) {
      assert(record.source === 'http://a.tgz');
      assert(record.prefix === 'namespace');
      assert(record.acl === 'public-read');
      assert(record.type === 'dev');
      assert(record.state === 'SUCCESS');
      assert.deepStrictEqual(record.data, {
        html: [], other: [],
      });
      assert(record.uniqId);
      assert(record.buildUniqId === buildUniqId);
      assert(record.credentialUniqId === credentialUniqId);
      assert.deepStrictEqual(record.credential, {
        bucketTag: 'dev', bucket: 'bucket',
        customDomain: null, customDomainProtocal: null,
      });
    }
  });

  it('GET /api/deploy/:uniqId success', async () => {
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
      stub.restore();
      return Promise.resolve([[], []]);
    });
    const { body: deployRes } = await app.httpRequest()
      .post('/api/deploy')
      .send({
        type: 'dev',
        buildUniqId,
        credentialSecret: 'thekey',
        credentialUniqId,
      });
    const { deployUniqId } = deployRes.data;
    assert(deployRes.success);
    assert(deployRes.data.deployUniqId);
    assert.deepStrictEqual(deployRes.data.uploadResult.html, []);
    assert.deepStrictEqual(deployRes.data.uploadResult.other, []);

    const { body } = await app.httpRequest()
      .get(`/api/deploy/${deployUniqId}`);
    assert(body.success);
    assert(body.data.deploy.uniqId);
    assert(body.data.deploy.createdAt);
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
        type: 'dev',
        buildUniqId,
        credentialSecret: 'thekey',
        credentialUniqId,
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert.deepStrictEqual(body.data.uploadResult.html, []);
    assert.deepStrictEqual(body.data.uploadResult.other, []);
  });

  it('POST /api/deploy validate error', async () => {
    const { header, body } = await app.httpRequest()
      .post('/api/deploy')
      .send({
        type: 'dev',
        buildUniqId,
        credentialUniqId,
      });
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(!body.succcess);
    assert(body.message === 'Validation Failed, credentialSecret: required');
  });

});
