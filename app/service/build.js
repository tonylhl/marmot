'use strict';

const Service = require('egg').Service;

module.exports = class BuildService extends Service {
  async queryBuildByUniqId({ uniqId }) {
    return await this.ctx.model.Build.findOne({
      where: {
        uniqId,
      },
    }
    );
  }

  async updateBuild({ uniqId, payload }) {
    return await this.ctx.model.Build.update(
      payload,
      {
        where: {
          uniqId,
        },
      }
    );
  }
};

