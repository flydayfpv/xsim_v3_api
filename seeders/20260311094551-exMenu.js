"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert("Menus", [

      {
        label: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        order: 1,
        menuGroupId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        label: "Training",
        path: "/training",
        icon: "GraduationCap",
        order: 2,
        menuGroupId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

    ]);

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete("Menus", null, {});

  }

};