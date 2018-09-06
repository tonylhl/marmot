'use strict';

module.exports = {
  up: async queryInterface => {
    await queryInterface.renameColumn('credentials', 'environment', 'bucketTag');
  },

  down: async queryInterface => {
    await queryInterface.renameColumn('credentials', 'bucketTag', 'environment');
  },
};
