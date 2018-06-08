'use strict';

const Controller = require('egg').Controller;

class ConfigController extends Controller {
  async show() {
    const result = await this.ctx.model.Config.findOne();
    this.ctx.body = {
      success: !!result,
      data: result ? result.data : {},
    };
  }

  async update() {
    const oldResult = await this.ctx.model.Config.findOne();

    if (!oldResult) {
      await this.ctx.model.Config.create({
        data: this.ctx.request.body,
      });
    } else {
      const uniqId = oldResult.uniqId;
      await this.ctx.model.Config.update({
        data: Object.assign(oldResult.data, this.ctx.request.body),
      }, {
        where: {
          uniqId,
        },
      });
    }
    this.ctx.body = {
      success: true,
    };
  }
}

module.exports = ConfigController;
