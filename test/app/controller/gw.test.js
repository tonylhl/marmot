'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

const postData = require('../../fixtures/post-gw.json');

describe('test/app/controller/gw.test.js', () => {

  beforeEach(async () => {
    app.mockService('webhook', 'push', {});
    await app.model.Build.destroy({
      where: {},
    });
    await app.model.JobName.destroy({
      where: {},
    });
  });

  it('POST /api/gw success', async () => {
    const { header, body } = await app.httpRequest()
      .post('/api/gw')
      .send(postData);
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    const data = body.data;
    assert(data.uniqId);
    assert.deepStrictEqual(data.data, postData);
    assert(data.buildNumber === '11');
    assert(data.jobName === 'jobName');
  });

  it('POST /api/gw error', async () => {
    const { header, body } = await app.httpRequest()
      .post('/api/gw')
      .send(Object.assign({}, postData, { environment: {} }));
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success === false);
    assert(body.message === 'environment.ci.JOB_NAME and environment.ci.BUILD_NUMBER are required.');
  });
});
