'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/middleware/cors.test.js', function() {

  it('cors with origin', async () => {
    const { header, body } = await app.httpRequest()
      .get('/api/admin/status')
      .set('origin', 'http://example.com');
    assert(header['access-control-allow-origin'] === 'http://example.com');
    assert(header['access-control-allow-credentials'] === 'true');
    assert(body.app);
  });

  it('cors ignore OPTIONS request', async () => {
    const { header } = await app.httpRequest()
      .options('/api/admin/status')
      .set('origin', 'http://example.com')
      .set('Access-Control-Request-Headers', 'x-custom-header');
    assert(header['access-control-allow-origin'] === 'http://example.com');
    assert(header['access-control-allow-credentials'] === 'true');
    assert(header['access-control-allow-headers'] === 'x-custom-header');
  });
});
