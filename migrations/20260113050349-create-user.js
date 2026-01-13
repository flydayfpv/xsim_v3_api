'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      emid: {
        type: Sequelize.INTEGER
      },
      citizenid: {
        type: Sequelize.INTEGER
      },
      password: {
        type: Sequelize.STRING
      },
      prefixID: {
        type: Sequelize.INTEGER
      },
      fname: {
        type: Sequelize.STRING
      },
      lname: {
        type: Sequelize.STRING
      },
      divisionID: {
        type: Sequelize.INTEGER
      },
      departmentID: {
        type: Sequelize.INTEGER
      },
      roleID: {
        type: Sequelize.INTEGER
      },
      lastLogin: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('users');
  }
};