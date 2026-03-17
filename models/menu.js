'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    static associate(models) {
      // เชื่อมโยงกับ Role แบบ Many-to-Many
      this.belongsToMany(models.role, {
        through: models.RoleMenu,
        foreignKey: 'menuId',
        otherKey: 'roleId',
        as: 'roles'
      });
      
      // (ทางเลือก) ถ้าคุณมีโมเดล MenuGroup สามารถใส่ association เพิ่มได้ที่นี่
      // this.belongsTo(models.MenuGroup, { foreignKey: 'menuGroupId' });
    }
  }

 // models/Menu.js

Menu.init({
  label: DataTypes.STRING,
  path: DataTypes.STRING,
  icon: DataTypes.STRING,
  order: DataTypes.INTEGER,
  menuGroupId: {
    type: DataTypes.INTEGER,
    field: 'menuGroupId' // <--- ระบุชื่อคอลัมน์ให้ตรงกับใน MySQL เป๊ะๆ
  }
}, {
  sequelize,
  modelName: 'Menu',
  tableName: 'Menus',
  underscored: false, // <--- ตั้งเป็น false เพื่อไม่ให้ Sequelize เติม _ ให้อัตโนมัติ
});

  return Menu;
}