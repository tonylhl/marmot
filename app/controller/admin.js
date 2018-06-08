'use strict';

const Controller = require('egg').Controller;

class AdminController extends Controller {
  async status() {
    this.ctx.body = {
      app: this.ctx.app,
    };
  }
  async buildDelete() {
    const uniqId = this.ctx.params.uniqId;
    const result = await this.ctx.model.Build.destroy({
      where: {
        uniqId,
      },
    });
    this.ctx.body = result;
  }
  async jobNameShow() {
    const result = await this.ctx.model.JobName.findAll();
    this.ctx.body = result;
  }
  async jobNameDalete() {
    const uniqId = this.ctx.params.uniqId;
    const result = await this.ctx.model.JobName.destroy({
      where: {
        uniqId,
      },
    });
    this.ctx.body = result;
  }
}

module.exports = AdminController;
