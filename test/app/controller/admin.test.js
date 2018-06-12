'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

const postData = require('../../fixtures/post-gw.json');

function* insertData(customData = {}) {
  return yield app.httpRequest()
    .post('/api/gw')
    .send(Object.assign({}, postData, customData));
}

describe('test/app/controller/admin.test.js', function() {

  beforeEach(function* () {
    yield app.model.sync({ force: true });
  });

  it('GET /api/admin/status return system info', function* () {
    const { body } = yield app.httpRequest()
      .get('/api/admin/status');
    assert(body.app);
  });

  it('GET /api/admin/build/delete/:uniqId delete record', function* () {
    const res = yield insertData();
    const {
      uniqId,
      buildNumber,
      jobName,
    } = res.body.data;

    const { body: queryResult } = yield app.httpRequest()
      .get(`/api/build/${jobName}/${buildNumber}`);
    assert(queryResult.success === true);
    assert(queryResult.data.result.jobName === 'web');
    assert(queryResult.data.result.buildNumber === '40');

    const { body: deleteCount } = yield app.httpRequest()
      .get(`/api/admin/build/delete/${uniqId}`);
    assert(deleteCount === 1);

    const { body: queryAgainResult } = yield app.httpRequest()
      .get(`/api/build/${jobName}/${buildNumber}`);
    assert(queryAgainResult.success === false);
    assert(queryAgainResult.data.result === null);
  });

  it('GET /api/admin/jobName/show query all jobNames', function* () {
    yield insertData();

    const { body } = yield app.httpRequest()
      .get('/api/admin/jobName/show');
    assert(body.length === 1);
    assert(body[0].id);
    assert(body[0].jobName === 'web');
    assert(body[0].uniqId);
    assert(body[0].created_at);
    assert(body[0].updated_at);
  });

  it('GET /api/admin/jobName/delete/:uniqId delete one jobName', function* () {
    yield insertData();

    const { body } = yield app.httpRequest()
      .get('/api/admin/jobName/show');
    assert(body.length === 1);

    const { body: deleteResult } = yield app.httpRequest()
      .get(`/api/admin/jobName/delete/${body[0].uniqId}`);
    assert(deleteResult === 1);
  });
});
