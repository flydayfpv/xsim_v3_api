"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("roleMenus", {

      id:{
        allowNull:false,
        autoIncrement:true,
        primaryKey:true,
        type:Sequelize.INTEGER
      },

      roleId:{
        type:Sequelize.INTEGER,
        references:{
          model:"roles",
          key:"id"
        }
      },

      menuId:{
        type:Sequelize.INTEGER,
        references:{
          model:"Menus",
          key:"id"
        }
      },

      createdAt:Sequelize.DATE,
      updatedAt:Sequelize.DATE
    });

  },

  async down(queryInterface){
    await queryInterface.dropTable("roleMenus");
  }
};