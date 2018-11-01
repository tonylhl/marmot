'use strict';

const uuidv4 = require('uuid/v4');
const deploy = require('../../test/fixtures/deploy-data.json');
const data = JSON.stringify(deploy);

module.exports = {
  up: async queryInterface => {
    const buildUniqId = '00000000-0000-0000-0000-000000001000';
    const credentialUniqId = 's3000000-0000-0000-0000-00credential';
    await queryInterface.bulkInsert('deploys',
      new Array(30).fill().map((_, i) => {
        return {
          source: 'https://gaius-favico.oss-cn-beijing.aliyuncs.com/dist.tgz',
          prefix: 'test/tahm',
          acl: 'public-read',
          state: [ 'INIT', 'SUCCESS', 'FAIL' ][i % 3],
          type: 'type1',
          data,
          uniqId: uuidv4(),
          buildUniqId,
          credentialUniqId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }));
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('deploys');
  },
};
