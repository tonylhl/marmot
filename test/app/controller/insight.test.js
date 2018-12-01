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

describe('test/app/controller/insight.test.js', function() {

  beforeEach(() => {
    app.mockService('webhook', 'pushBuildNotification', {});
  });

  it('GET /api/insight/ci query ci data', async () => {
    await insertData({
      environment: {
        ci: {
          RUNNER_TYPE: 'GITLAB_CI',
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

    await insertData({
      environment: {
        ci: {
          RUNNER_TYPE: 'GITLAB_CI',
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

    const { body } = await app.httpRequest()
      .get('/api/insight/ci');
    console.log(JSON.stringify(body, null, 2));
    assert.deepStrictEqual(body, {
      success: true,
      data: [
        {
          jobName: 'android_app',
          linePercent: 95.24,
          passPercent: 100,
          lastCommit: {
            committer: 'user',
            shortHash: 'ecb4bac',
            gitUrl: 'http://host/group/repo',
          },
          humanizeDuration: 0,
          linePercentList: [
            95.24,
          ],
          passPercentList: [
            100,
          ],
          durationList: [],
        },
        {
          jobName: 'ios_app',
          linePercent: 95.24,
          passPercent: 100,
          lastCommit: {
            committer: 'user',
            shortHash: 'ecb4bac',
            gitUrl: 'http://host/group/repo',
          },
          humanizeDuration: 0,
          linePercentList: [
            95.24,
          ],
          passPercentList: [
            100,
          ],
          durationList: [],
        },
      ],
    });
  });
});
