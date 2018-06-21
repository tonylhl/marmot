'use strict';

const {
  Controller,
} = require('egg');

class HomeController extends Controller {
  async index() {
    this.ctx.body = await this.app.render({}, {
      title: 'Marmot PlatForm',
      pageId: 'home',
      USE_DATAHUB: this.config.marmotView.useDataHub,
      DATAHUB_MARMOT_VIEW_ADDRESS: this.config.marmotView.datahubMarmotViewUrl,
      SERVER_ADDRESS: this.config.marmotView.serverUrl,
      STATIC_ADDRESS: this.config.marmotView.staticUrl,
      JENKINS_ADDRESS: this.config.marmotView.jenkinsUrl,
      DATAHUB_ADDRESS: this.config.marmotView.datahubUrl,
      assetsUrl: this.config.marmotView.assetsUrl,
      version: this.app.config.pkg.version,
    });
  }
}

module.exports = HomeController;
