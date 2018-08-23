'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

const postData = require('../../fixtures/post-gw.json');

async function insertData(customData = {}) {
  return await app.httpRequest()
    .post('/api/gw')
    .send(Object.assign({}, postData, customData));
}

describe('test/app/controller/admin.test.js', function() {

  it('GET /api/admin/status return system info', async () => {
    const { body } = await app.httpRequest()
      .get('/api/admin/status');
    assert(body.app);
  });

  it('GET /api/admin/build/delete/:uniqId delete record', async () => {
    const res = await insertData();
    const {
      uniqId,
      buildNumber,
      jobName,
    } = res.body.data;

    const { body: queryResult } = await app.httpRequest()
      .get(`/api/build/${jobName}/${buildNumber}`);
    assert(queryResult.success === true);
    assert(queryResult.data.result.jobName === 'foo');
    assert(queryResult.data.result.buildNumber === '1074395');

    const { body: deleteCount } = await app.httpRequest()
      .get(`/api/admin/build/delete/${uniqId}`);
    assert(deleteCount === 1);

    const { body: queryAgainResult } = await app.httpRequest()
      .get(`/api/build/${jobName}/${buildNumber}`);
    assert(queryAgainResult.success === false);
    assert(queryAgainResult.data.result === null);
  });

  it('GET /api/admin/jobName/show query all jobNames', async () => {
    await insertData();

    const { body } = await app.httpRequest()
      .get('/api/admin/jobName/show');
    assert(body.length === 1);
    assert(body[0].jobName === 'foo');
    assert(body[0].uniqId);
    assert(body[0].createdAt);
    assert(body[0].updatedAt);
  });

  it('GET /api/admin/jobName/delete/:uniqId delete one jobName', async () => {
    await insertData();

    const { body } = await app.httpRequest()
      .get('/api/admin/jobName/show');
    assert(body.length === 1);

    const { body: deleteResult } = await app.httpRequest()
      .get(`/api/admin/jobName/delete/${body[0].uniqId}`);
    assert(deleteResult === 1);
  });
});
