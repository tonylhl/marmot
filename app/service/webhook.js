'use strict';

const {
  Service,
} = require('egg');
const DingTalk = require('marmot-dingtalk');

/* istanbul ignore next */
module.exports = class WebHookService extends Service {
  async push(data = {}) {
    const ctx = this.ctx;
    // get all webhooks
    const globalConfig = await this.ctx.model.Config.findOne();

    if (!globalConfig || !globalConfig.data || !globalConfig.data.webhooks) {
      return;
    }
    const {
      webhooks,
    } = globalConfig.data;

    try {
      return await Promise.all(webhooks
        .filter(webhook => webhook.tag === 'build')
        .map(webhook => DingTalk.call(this, webhook, data)));
    } catch (e) {
      ctx.logger.error(e);
    }
  }
};
