'use strict';

const uuidv4 = require('uuid/v4');
const deploy = require('../../test/fixtures/deploy-data.json');
const data = JSON.stringify(deploy);

module.exports = {
  up: queryInterface => {
    const ids = Array.apply(null, Array(30)).map((n, i) => { return ++i; });

    return queryInterface.bulkInsert('deploys', ids.map(item => {
      return {
        id: item,
        source: 'https://gaius-favico.oss-cn-beijing.aliyuncs.com/dist.tgz',
        region: 'oss-cn-beijing',
        bucket: 'test-upload-tahm',
        prefix: 'test/tahm',
        acl: 'public-read',
        data,
        uniqId: uuidv4(),
        created_at: new Date(),
        updated_at: new Date(),
        buildId: item,
      };
    }), {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('deploys', null, {});
  },
};
