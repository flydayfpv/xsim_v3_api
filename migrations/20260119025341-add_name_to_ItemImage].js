'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'itemImages',        // table name
      'name',              // column name
      {
        type: Sequelize.STRING,
        allowNull: true,   // หรือ false ตามต้องการ
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('itemImages', 'name');
  }
};
