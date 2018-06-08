'use strict';

const Service = require('egg').Service;
const ChatBot = require('dingtalk-robot-sender');
const url = require('url');

module.exports = class DingtalkService extends Service {
  async push(data = {}) {
    // get all webhooks
    const globalConfig = await this.ctx.model.Config.findOne();
    if (!globalConfig || !globalConfig.data || !globalConfig.data.webhooks) {
      return;
    }
    const webhooks = globalConfig.data.webhooks;
    const {
      gitCommitInfo,
      enviroment = {},
      testInfo,
      packages,
    } = data;
    const { jenkins } = enviroment;

    const title = `[Marmot] **${jenkins.JOB_NAME}** build passed.`;

    // message body
    let text = [];
    const gitUrl = `${gitCommitInfo.gitUrl}`;
    const gitUrlInfo = url.parse(gitUrl);
    const gitBaseUtl = `${gitUrlInfo.protocol}//${gitUrlInfo.host}`;
    text.push(`### Repository ${jenkins.JOB_NAME} build passed`);
    text.push('');
    text.push(`#### Platform: ${enviroment.platform}`);
    text.push('#### Commit');
    text.push(`[${gitCommitInfo.shortHash}](${gitUrl}/commit/${gitCommitInfo.hash}): ${gitCommitInfo.subject}`);
    text.push(`> committer:[@${gitCommitInfo.committer.name}](${gitBaseUtl}/u/${gitCommitInfo.committer.email.split('@')[0]})
    author:[@${gitCommitInfo.author.name}](${gitBaseUtl}/u/${gitCommitInfo.author.email.split('@')[0]})`);

    // test report info
    text.push('#### Test report');
    const staticUrl = `http:${this.config.marmotView.staticUrl}/jenkins/${jenkins.JOB_NAME}/${jenkins.BUILD_NUMBER}/`;
    const passLogUrl = staticUrl + testInfo.testHtmlReporterPath;
    testInfo && testInfo.tests && text.push(`> Test Cases: [(${testInfo.tests}/${testInfo.passes}) ${testInfo.passPercent}% passed](${passLogUrl})`);

    const covUrl = staticUrl + testInfo.coverageHtmlReporterPath;
    testInfo && testInfo.linePercent && text.push(`> Line Coverage: [${testInfo.linePercent}](${covUrl})`);

    // release
    text.push('#### Release');
    const pkgText = packages.map(i => i && `> [${i.type}-${i.version}](${staticUrl + i.path})`);
    if (pkgText.length) {
      text = text.concat(pkgText);
    } else {
      text.push('> none');
    }

    jenkins.BUILD_NUMBER && text.push(`[> See details on marmot-web](http:${this.config.marmotView.serverUrl}/onebuild?jobName=${jenkins.JOB_NAME}&buildNumber=${jenkins.BUILD_NUMBER})`);

    // trigger webhooks
    try {
      const chatbots = webhooks.map(webhook => new ChatBot({ webhook }));
      return await Promise.all(chatbots.map(robot => robot.markdown(title, text.join('\n\n'))));
    } catch (e) {
      console.error(e);
    }
  }
};
