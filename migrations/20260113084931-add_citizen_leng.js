'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'citizenid', {
      type: Sequelize.BIGINT,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'citizenid', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
