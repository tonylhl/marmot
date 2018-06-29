'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

const postData = require('../../fixtures/post-gw.json');

describe('test/app/controller/gw.test.js', () => {

  beforeEach(function* () {
    app.mockService('webhook', 'push', {});
    yield app.model.Build.destroy({
      where: {},
    });
    yield app.model.JobName.destroy({
      where: {},
    });
  });

  it('POST /api/gw success', function* () {
    const { header, body } = yield app.httpRequest()
      .post('/api/gw')
      .send(postData);
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success);
    assert(body.message === '');
    const data = body.data;
    assert(data.id);
    assert(data.uniqId);
    assert.deepStrictEqual(data.data, postData);
    assert(data.buildNumber === '40');
    assert(data.jobName === 'web');
  });

  it('POST /api/gw error', function* () {
    const { header, body } = yield app.httpRequest()
      .post('/api/gw')
      .send(Object.assign({}, postData, { environment: {} }));
    assert(header['content-type'] === 'application/json; charset=utf-8');
    assert(body.success === false);
    assert(body.message === 'environment.jenkins.JOB_NAME and environment.jenkins.BUILD_NUMBER are required');
  });
});
