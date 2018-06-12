'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/config.test.js', () => {

  beforeEach(function* () {
    app.mockService('dingtalk', 'push', {});
    yield app.model.Config.destroy({
      where: {},
    });
  });

  function* assertConfig(app, data) {
    const res = yield app.httpRequest()
      .get('/api/config');
    assert.deepStrictEqual(res.body, data);
  }

  it('POST /api/config create and update', function* () {
    yield assertConfig(app, {
      success: true,
      data: {},
    });

    let res = yield app.httpRequest()
      .post('/api/config')
      .send({
        type: 'webhooks',
        webhooks: [ 'url-1', 'url-2' ],
      });
    assert.deepStrictEqual(res.body, {
      success: true,
    });
    yield assertConfig(app, {
      success: true,
      data: {
        type: 'webhooks',
        webhooks: [ 'url-1', 'url-2' ],
      },
    });

    res = yield app.httpRequest()
      .post('/api/config')
      .send({
        type: 'webhooks',
        webhooks: [ 'url-3', 'url-4' ],
      });
    assert.deepStrictEqual(res.body, {
      success: true,
    });
    yield assertConfig(app, {
      success: true,
      data: {
        type: 'webhooks',
        webhooks: [ 'url-3', 'url-4' ],
      },
    });
  });
});
