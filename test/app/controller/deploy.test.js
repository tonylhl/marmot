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
    const stub = sinon.stub(marmotRelease, 'uploadPackage').callsFake(function() {
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
    await app.httpRequest()
      .post('/api/deploy')
      .send({
        type: 'dev',
        buildUniqId,
        credentialSecret: 'thekey',
        credentialUniqId,
      });
    // return one deploy result
    const { body } = await app.httpRequest()
      .get(`/api/deploy?buildUniqId=${buildUniqId}`);
    assert(body.success);
    assert(body.data[0].source === 'http://a.tgz');
    assert(body.data[0].prefix === 'namespace');
    assert(body.data[0].acl === 'public-read');
    assert(body.data[0].type === 'dev');
    assert(body.data[0].state === 'SUCCESS');
    assert.deepStrictEqual(body.data[0].data, {
      html: [], other: [],
    });
    assert(body.data[0].uniqId);
    assert(body.data[0].buildUniqId === buildUniqId);
    assert(body.data[0].credentialUniqId === credentialUniqId);
    assert.deepStrictEqual(body.data[0].credential, {
      bucketTag: 'dev', bucket: 'bucket',
      customDomain: null, customDomainProtocal: null,
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
