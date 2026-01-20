'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'baggages',          // ชื่อตาราง
      'itemCategoryID',              // ชื่อคอลัมน์
      {
        type: Sequelize.INTEGER,
        allowNull: false,   // หรือ false ตามต้องการ
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'baggages',
      'itemCategoryID'
    );
  }
};

