'use strict';

const uuidv4 = require('uuid/v4');

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('jobNames', [
      'foo',
      'baz',
      'qux',
      'bar',
    ].map(
      item => {
        return {
          jobName: item,
          uniqId: uuidv4(),
          created_at: new Date(),
          updated_at: new Date(),
        };
      }
    ), {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('jobNames', null, {});
  },
};
