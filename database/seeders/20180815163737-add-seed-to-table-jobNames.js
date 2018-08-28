'use strict';

const uuidv4 = require('uuid/v4');

module.exports = {
  up: async queryInterface => {
    await queryInterface.bulkInsert('jobNames', [
      'foo',
      'baz',
      'qux',
      'bar',
    ].map(
      item => {
        return {
          jobName: item,
          uniqId: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    ));
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('jobNames');
  },
};
