'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('itemImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: { // Added missing colon
        type: Sequelize.STRING,
        allowNull: false
      },
      top: {
        type: Sequelize.STRING
      },
      side: {
        type: Sequelize.STRING
      },
      realImage: {
        type: Sequelize.STRING
      },
      itemCategoryID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'itemCategories', // Make sure this table name matches your Categories migration
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      description: {
        type: Sequelize.TEXT // Changed to TEXT to allow for longer technical descriptions
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('itemImages');
  }
};