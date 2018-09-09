'use strict';

const {
  Controller,
} = require('egg');

const {
  sendMarkdown,
} = require('marmot-dingtalk');

class DelegateController extends Controller {

  async message() {
    const ctx = this.ctx;
    const {
      webhook,
      text,
      title,
    } = ctx.request.body;

    await sendMarkdown({
      webhook,
      title: title || 'title',
      text,
    });

    ctx.success({});
  }

}

module.exports = DelegateController;
