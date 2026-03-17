"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MenuGroups", {
      id:{
        allowNull:false,
        autoIncrement:true,
        primaryKey:true,
        type:Sequelize.INTEGER
      },
      name:Sequelize.STRING,
      order:Sequelize.INTEGER,
      createdAt:Sequelize.DATE,
      updatedAt:Sequelize.DATE
    });
  },

  async down(queryInterface){
    await queryInterface.dropTable("MenuGroups");
  }
};