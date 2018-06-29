'use strict';

const {
  Service,
} = require('egg');
const DingTalk = require('marmot-dingtalk');

/* istanbul ignore next */
module.exports = class WebHookService extends Service {
  async push(data = {}) {
    // get all webhooks
    const globalConfig = await this.ctx.model.Config.findOne();

    if (!globalConfig || !globalConfig.data || !globalConfig.data.webhooks) {
      return;
    }
    const webhooks = globalConfig.data.webhooks;

    // trigger webhooks
    // TODO add type to the webhook
    try {
      return await Promise.all(webhooks.map(webhook => DingTalk.call(this, webhook, data)));
    } catch (e) {
      console.error(e);
    }
  }
};
