"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert("MenuGroups",[

      {
        id:1,
        name:"Operations",
        order:1,
        createdAt:new Date(),
        updatedAt:new Date()
      },

      {
        id:2,
        name:"Management",
        order:2,
        createdAt:new Date(),
        updatedAt:new Date()
      },

      {
        id:3,
        name:"System",
        order:3,
        createdAt:new Date(),
        updatedAt:new Date()
      }

    ]);

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete("MenuGroups",null,{});

  }

};