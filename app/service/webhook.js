'use strict';

const {
  Service,
} = require('egg');
const DingTalk = require('marmot-dingtalk');

/* istanbul ignore next */
module.exports = class WebHookService extends Service {
  async sendMarkdown({ tag, title = 'title', text }) {
    const globalConfig = await this.ctx.model.Config.findOne();
    const {
      webhooks = [],
    } = globalConfig.data;
    const targets = webhooks.filter(i => i.tag === tag);
    await Promise.all(targets.map(async target => {
      await DingTalk.sendMarkdown({
        webhook: {
          url: target.url,
        },
        title,
        text,
      });
    }));
  }

  async pushBuildNotification(data = {}) {
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
      await Promise.all(webhooks
        .filter(webhook => webhook.tag === 'build')
        .map(webhook => DingTalk({
          webhook,
          data,
          staticServerUrl: `http:${this.config.marmotView.staticUrl}`,
          marmotServerUrl: `http:${this.config.marmotView.marmotHost}`,
        })));
    } catch (e) {
      ctx.logger.error(e);
    }
  }
};
