'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/home.test.js', () => {

  it('assert keys', function* () {
    const pkg = require('../../../package.json');
    assert(app.config.keys.startsWith(pkg.name));

    // const ctx = app.mockContext({});
    // yield ctx.service.xx();
  });

  it('GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect(/Marmot Platform/)
      .expect(200);
  });
});
