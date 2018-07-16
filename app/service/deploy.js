'use strict';

const {
  Service,
} = require('egg');
const os = require('os');
const fs = require('mz/fs');
const path = require('path');
const pMap = require('p-map');
const OSS = require('ali-oss');
const urllib = require('urllib');
const rimraf = require('rimraf');
const crypto = require('crypto');
const compressing = require('compressing');
const AgentKeepalive = require('agentkeepalive');

module.exports = class DeployService extends Service {

  async createTempDir(prefix) {
    const current_date = (new Date()).valueOf().toString();
    const random = Math.random().toString();
    const randomHash = crypto.createHash('sha1').update(current_date + random).digest('hex');
    return await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-${randomHash}`));
  }

  async fetchSource(sourceUrl) {
    const downloadDir = await this.createTempDir('marmot-fetch-source');
    const downloadFile = path.join(path.join(downloadDir, path.basename(sourceUrl)));
    await urllib.request(sourceUrl, {
      writeStream: fs.createWriteStream(downloadFile),
    });
    return {
      downloadDir,
      downloadFile,
    };
  }

  async uploadPackage({
    sourceUrl,
    prefix,
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
    acl,
  }) {

    const extWhiteList = [
      '.html', '.css', '.js',
      '.png', '.jpg', '.json', '.ico',
    ];

    const agentKeepalive = new AgentKeepalive({
      maxSockets: 100,
      maxFreeSockets: 10,
      timeout: 30000,
      freeSocketKeepAliveTimeout: 15000, // free socket keepalive for 30 seconds
    });

    const urllib = require('urllib').create({
      agent: agentKeepalive,
    });

    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      timeout: 120 * 1000,
      urllib,
    });


    const { downloadDir, downloadFile } = await this.fetchSource(sourceUrl);
    const uncompressPath = path.join(downloadDir, 'marmot-build');
    await compressing.tgz.uncompress(downloadFile, uncompressPath);

    const [
      html,
      other,
    ] = await this.getFileList(uncompressPath, uncompressPath, extWhiteList);

    const mapper = item => {
      const tempPath = item.path.split('/').splice(1).join('/');
      const localPath = path.join(uncompressPath, item.path);
      const ossPath = path.join(prefix, tempPath);
      return this.uploadOne({ ossPath, localPath, acl, client });
    };

    console.log('upload assets:');
    const otherUrlPath = await pMap(other, mapper, { concurrency: 2 });

    console.log('upload html:');
    const htmlUrlList = await pMap(html, mapper, { concurrency: 2 });

    console.log('upload result:');
    console.log(htmlUrlList.map(i => i.url).join('\n'));

    if (process.env.NODE_ENV !== 'test') {
      rimraf.sync(downloadDir);
    }
    return [ htmlUrlList, otherUrlPath ];
  }

  async uploadOne({ ossPath, localPath, acl, client, retryTimes = 0 }) {
    const MAX_RETRY_TIMES = 3;
    let uploadRes;
    let aclResult;

    try {
      uploadRes = await client.put(ossPath, localPath);
      aclResult = await client.putACL(ossPath, acl);
    } catch (e) { console.log(e); }
    if (uploadRes && uploadRes.res && uploadRes.res.status === 200 &&
      aclResult && aclResult.res && aclResult.res.status === 200) {
      console.log(`[DONE] ${uploadRes.url}`);
      return {
        success: true,
        ossPath,
        url: uploadRes.url,
      };
    }
    retryTimes += 1;
    if (retryTimes < MAX_RETRY_TIMES) {
      console.log(`[RETRY] ${ossPath}`);
      return await this.uploadOne({ ossPath, localPath, acl, client, retryTimes });
    }
    console.log(`[FAIL] ${ossPath}`);
    return {
      success: false,
      ossPath,
    };
  }

  async getFileList(currentDirectory, root, suffix = []) {
    const htmlExt = '.html';
    const html = [];
    const other = [];

    const tranverse = async function(currentDirectory, root) {
      const currentDir = await fs.readdir(currentDirectory);

      for (const i in currentDir) {
        const currentFile = currentDir[i];
        const currentFilePath = path.resolve(currentDirectory, currentFile);
        const stats = await fs.stat(currentFilePath);

        if (stats.isDirectory()) {
          await tranverse(currentFilePath, root);
          continue;
        }

        if (stats.isFile() && (suffix.indexOf(path.extname(currentFilePath)) + 1)) {
          if (currentFilePath.endsWith(htmlExt)) {
            html.push({
              name: path.basename(currentFilePath),
              path: path.relative(root, currentFilePath),
            });
          } else {
            other.push({
              name: path.basename(currentFilePath),
              path: path.relative(root, currentFilePath),
            });
          }
        }
      }
    };
    await tranverse(currentDirectory, root);
    return [ html, other ];
  }
};
