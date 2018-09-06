'use strict';

module.exports = {
  up: async queryInterface => {
    await queryInterface.bulkInsert('credentials', [{
      provider: 'AMAZON_S3',
      bucketTag: 'dev',
      namespace: 'foo',
      region: 'foo',
      bucket: 'foo',
      accessKeyId: '',
      accessKeySecret: '',
      uniqId: 's3000000-0000-0000-0000-00credential',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      provider: 'ALIYUN_OSS',
      bucketTag: 'prod',
      namespace: 'foo',
      region: 'foo',
      bucket: 'foo',
      accessKeyId: '',
      accessKeySecret: '',
      uniqId: 'oss00000-0000-0000-0000-00credential',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('credentials');
  },
};
