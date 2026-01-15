'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('baggage', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      top: {
        type: Sequelize.STRING
      },
      side: {
        type: Sequelize.STRING
      },
      areaID: {
        type: Sequelize.INTEGER
      },
      itemImageID: {
        type: Sequelize.INTEGER
      },
      itemPos: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('baggage');
  }
};