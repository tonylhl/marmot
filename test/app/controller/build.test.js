'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

const postData = require('../../fixtures/post-gw.json');

function* insertData(customData = {}) {
  yield app.httpRequest()
    .post('/api/gw')
    .send(Object.assign({}, postData, customData));
}

describe('test/app/controller/build.test.js', function() {

  beforeEach(function* () {
    app.mockService('dingtalk', 'push', {});
    yield app.model.sync({ force: true });
  });

  it('GET /api/build query all builds', function* () {
    yield insertData({
      environment: {
        jenkins: {
          JOB_NAME: 'android',
          BUILD_NUMBER: '10',
        },
        platform: 'android',
        os: {
          nodeVersion: 'v1.1.2',
          platform: 'linux',
        },
      },
    });

    yield insertData({
      environment: {
        jenkins: {
          JOB_NAME: 'ios',
          BUILD_NUMBER: '20',
        },
        platform: 'ios',
        os: {
          nodeVersion: 'v1.1.2',
          platform: 'linux',
        },
      },
    });

    const { body } = yield app.httpRequest()
      .get('/api/build');
    assert(body.success === true);
    assert.deepStrictEqual(body.allJobName, [ 'android', 'ios' ]);
    assert(body.data.total);
    assert(body.data.page);
    assert(body.data.result.length === 2);
    assert(body.data.result[0].jobName === 'android');
    assert(body.data.result[0].buildNumber === '10');
    assert(body.data.result[0].data);
    assert(body.data.result[0].uniqId);
    assert(body.data.result[0].created_at);
    assert(body.data.result[1].jobName === 'ios');
    assert(body.data.result[1].buildNumber === '20');
    assert(body.data.result[1].data);
    assert(body.data.result[1].uniqId);
    assert(body.data.result[1].created_at);
  });

  it('GET /api/build/:jobName query by jobName', function* () {
    yield insertData({
      environment: {
        jenkins: {
          JOB_NAME: 'android_app',
          BUILD_NUMBER: '1',
        },
        platform: 'android',
        os: {
          nodeVersion: 'v1.1.2',
          platform: 'linux',
        },
      },
    });

    yield insertData({
      environment: {
        jenkins: {
          JOB_NAME: 'ios_app',
          BUILD_NUMBER: '1',
        },
        platform: 'ios',
        os: {
          nodeVersion: 'v1.1.2',
          platform: 'linux',
        },
      },
    });

    const { body } = yield app.httpRequest()
      .get('/api/build/ios_app');
    assert(body.success === true);
    assert.deepStrictEqual(body.allJobName, [ 'android_app', 'ios_app' ]);
    assert(body.data.total);
    assert(body.data.page);
    assert(body.data.result.length === 1);
    assert(body.data.result[0].jobName === 'ios_app');
    assert(body.data.result[0].buildNumber === '1');
    assert(body.data.result[0].data);
    assert(body.data.result[0].uniqId);
    assert(body.data.result[0].created_at);
  });

  it('GET /api/build/:jobName/:buildNumber query by jobName and buildNumber', function* () {
    yield insertData({
      environment: {
        jenkins: {
          JOB_NAME: 'android_app',
          BUILD_NUMBER: '1',
        },
        platform: 'android',
        os: {
          nodeVersion: 'v1.1.2',
          platform: 'linux',
        },
      },
    });

    yield insertData({
      environment: {
        jenkins: {
          JOB_NAME: 'ios_app',
          BUILD_NUMBER: '1',
        },
        platform: 'ios',
        os: {
          nodeVersion: 'v1.1.2',
          platform: 'linux',
        },
      },
    });

    const { body } = yield app.httpRequest()
      .get('/api/build/ios_app/1');
    assert(body.success === true);
    assert(body.message === '');
    assert(body.data.result.jobName === 'ios_app');
    assert(body.data.result.buildNumber === '1');
    assert(typeof body.data.result.data === 'object');
    assert(body.data.result.uniqId);
    assert(body.data.result.created_at);
  });
});
