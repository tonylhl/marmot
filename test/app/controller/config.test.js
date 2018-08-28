'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/config.test.js', () => {

  beforeEach(() => {
    app.mockService('webhook', 'push', {});
  });

  async function assertConfig(app, data) {
    const res = await app.httpRequest()
      .get('/api/config');
    assert.deepStrictEqual(res.body, data);
  }

  it('POST /api/config create and update', async () => {
    await assertConfig(app, {
      success: true,
      message: '',
      data: {},
    });

    let res = await app.httpRequest()
      .post('/api/config')
      .send({
        type: 'webhooks',
        webhooks: [ 'url-1', 'url-2' ],
      });
    assert.deepStrictEqual(res.body, {
      success: true,
      message: '',
      data: {},
    });
    await assertConfig(app, {
      success: true,
      message: '',
      data: {
        type: 'webhooks',
        webhooks: [ 'url-1', 'url-2' ],
      },
    });

    res = await app.httpRequest()
      .post('/api/config')
      .send({
        type: 'webhooks',
        webhooks: [ 'url-3', 'url-4' ],
      });
    assert.deepStrictEqual(res.body, {
      success: true,
      message: '',
      data: {},
    });
    await assertConfig(app, {
      success: true,
      message: '',
      data: {
        type: 'webhooks',
        webhooks: [ 'url-3', 'url-4' ],
      },
    });
  });
});
