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

describe('test/app/controller/build.test.js', function() {

  let ctx;
  beforeEach(() => {
    ctx = app.mockContext();
    app.mockService('webhook', 'pushBuildNotification', {});
  });

  it('GET /api/build query all builds', async () => {
    await ctx.model.Build.bulkCreate([{
      jobName: 'android',
      buildNumber: '10',
      data: {},
    }, {
      jobName: 'ios',
      buildNumber: '20',
      data: {},
    }]);
    await ctx.model.JobName.bulkCreate([{
      jobName: 'android',
    }, {
      jobName: 'ios',
    }]);
    const { body } = await app.httpRequest()
      .get('/api/build');
    assert(body.success === true);
    assert.deepStrictEqual(body.data.allJobName, [ 'android', 'ios' ]);
    assert(body.data.total);
    assert(body.data.page);
    assert(body.data.result.length === 2);
    assert(body.data.result[0].jobName);
    assert(body.data.result[0].buildNumber);
    assert(body.data.result[0].data);
    assert(body.data.result[0].uniqId);
    assert(body.data.result[0].createdAt);
    assert(body.data.result[1].jobName);
    assert(body.data.result[1].buildNumber);
    assert(body.data.result[1].data);
    assert(body.data.result[1].uniqId);
    assert(body.data.result[1].createdAt);
  });

  it('GET /api/build/:uniqId query one build', async () => {
    const [{ uniqId }] = await ctx.model.Build.bulkCreate([{
      jobName: 'android',
      buildNumber: '10',
      data: {},
    }, {
      jobName: 'ios',
      buildNumber: '20',
      data: {},
    }]);
    await ctx.model.JobName.bulkCreate([{
      jobName: 'android',
    }, {
      jobName: 'ios',
    }]);
    const { body } = await app.httpRequest()
      .get(`/api/build/${uniqId}`);
    assert(body.success === true);
    assert(body.data.jobName === 'android');
    assert(body.data.buildNumber === '10');
    assert(body.data.data);
    assert(body.data.uniqId === uniqId);
    assert(body.data.createdAt);
  });

  it('GET /api/build/:jobName query by jobName', async () => {
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
      .get('/api/build?jobName=ios_app');
    assert.deepStrictEqual(body.data.allJobName, [ 'android_app', 'ios_app' ]);
    assert(body.data.total);
    assert(body.data.page);
    assert(body.data.result.length === 1);
    assert(body.data.result[0].jobName === 'ios_app');
    assert(body.data.result[0].buildNumber === '1');
    assert(body.data.result[0].data);
    assert(body.data.result[0].uniqId);
    assert(body.data.result[0].createdAt);
  });

  it('GET /api/build/:jobName/:buildNumber query by jobName and buildNumber', async () => {
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
      .get('/api/build?jobName=ios_app&buildNumber=1');
    assert(body.success === true);
    assert(body.data.jobName === 'ios_app');
    assert(body.data.buildNumber === '1');
    assert(typeof body.data.data === 'object');
    assert(body.data.uniqId);
    assert(body.data.createdAt);
  });

  it('GET /api/latestBuild/:jobName/:gitBranch+ query latest build', async () => {
    await ctx.model.Build.bulkCreate([{
      jobName: 'ios_app',
      gitBranch: 'master',
      buildNumber: '10',
      data: {
        environment: {
          os: {
            nodeVersion: 'v1.1.2',
            platform: 'linux',
          },
        },
      },
    }, {
      jobName: 'web_app',
      gitBranch: 'master',
      buildNumber: '20',
      data: {
        environment: {
          os: {
            nodeVersion: 'v1.1.2',
            platform: 'linux',
          },
        },
      },
    }]);
    const { body } = await app.httpRequest()
      .get('/api/latestBuild/web_app/master');
    assert(body.success === true);
    assert(body.data.result[0].jobName === 'web_app');
    assert(body.data.result[0].buildNumber === '20');
  });

  it('POST /api/build/:uniqId update build extendInfo', async () => {
    const appId = 'APP_ONE';
    await app.model.Config.create({
      data: {},
    });
    await app.model.Credential.create({
      provider: 'ALIYUN_OSS',
      bucketTag: 'dev',
      region: 'region',
      bucket: 'bucket',
      namespace: 'namespace',
      accessKeyId: 'accessKeyId',
      accessKeySecret: 'accessKeySecret',
    });
    await insertData({
      gitCommitInfo: {
        gitBranch: 'feat/one',
        gitUrl: 'http://domain/url/one',
      },
      extraInfo: {
        appId,
      },
      environment: {
        ci: {
          RUNNER_TYPE: 'GITLAB_CI',
          JOB_NAME: 'jobName',
          BUILD_NUMBER: '11',
        },
        platform: 'web',
      },
    });

    await app.delay(1000);

    const { body: { data: { uniqId: buildUniqId } } } = await insertData({
      gitCommitInfo: {
        gitBranch: 'feat/two',
        gitUrl: 'http://domain/url/two',
      },
      extraInfo: {
        appId,
      },
      environment: {
        ci: {
          RUNNER_TYPE: 'GITLAB_CI',
          JOB_NAME: 'jobName',
          BUILD_NUMBER: '12',
        },
        platform: 'web',
      },
    });
    await ctx.model.JobName.bulkCreate([{
      jobName: 'android',
    }, {
      jobName: 'ios',
    }]);
    const { body: updateRes } = await app.httpRequest()
      .put(`/api/build/${buildUniqId}`)
      .send({
        extendInfo: {
          key: 'value',
        },
      });
    assert.deepStrictEqual(updateRes, {
      success: true,
      data: [ 1 ],
    });
  });
});
