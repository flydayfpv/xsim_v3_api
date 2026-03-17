"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("Menus", {

      id:{
        allowNull:false,
        autoIncrement:true,
        primaryKey:true,
        type:Sequelize.INTEGER
      },

      label:Sequelize.STRING,

      path:Sequelize.STRING,

      icon:Sequelize.STRING,

      order:Sequelize.INTEGER,

      menuGroupId:{
        type:Sequelize.INTEGER,
        references:{
          model:"MenuGroups",
          key:"id"
        }
      },

      createdAt:Sequelize.DATE,
      updatedAt:Sequelize.DATE
    });

  },

  async down(queryInterface){
    await queryInterface.dropTable("Menus");
  }
};