'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class role extends Model {
    static associate(models) {
      // 1. เชื่อมไปหา User (มีอยู่เดิม)
      this.hasMany(models.user, { foreignKey: 'roleID', as: 'users' });

      // 2. เชื่อมไปหา Menu แบบ Many-to-Many
      // สำคัญ: through ต้องระบุเป็น models.RoleMenu เพื่อให้ไปใช้การตั้งค่าจากไฟล์ RoleMenu.js
      this.belongsToMany(models.Menu, {
        through: models.RoleMenu,
        foreignKey: 'roleId',
        otherKey: 'menuId',
        as: 'menus' // ใช้ alias นี้ใน include ฝั่ง Controller
      });
    }
  }

  role.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'role',
    tableName: 'roles', // ระบุชื่อตารางใน DB
    timestamps: true
  });

  return role;
};