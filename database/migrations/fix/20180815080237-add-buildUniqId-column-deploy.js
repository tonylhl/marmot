'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    queryInterface.addColumn(
      'deploys',
      'buildId',
      {
        type: INTEGER,
      }
    );

    queryInterface.sequelize.query(
      `ALTER TABLE deploys
      ADD CONSTRAINT deploys_ibfk_1 FOREIGN KEY (buildId)
      REFERENCES builds (id) ON UPDATE CASCADE ON DELETE CASCADE;`
    );

  },

  down: queryInterface => {
    queryInterface.sequelize.query('ALTER TABLE deploys DROP FOREIGN KEY build_id_to_deploy_fkey;');
    queryInterface.sequelize.query('ALTER TABLE deploys DROP COLUMN buildId;');
  },

};
