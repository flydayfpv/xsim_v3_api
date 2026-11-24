'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      // Associations เดิม
      user.belongsTo(models.prefix, { foreignKey: 'prefixID' });
      user.belongsTo(models.division, { foreignKey: 'divisionID' });
      user.belongsTo(models.department, { foreignKey: 'departmentID' });
      user.belongsTo(models.role, { foreignKey: 'roleID' });
      user.hasMany(models.training_sessions, { foreignKey: 'userId' });
      user.hasMany(models.corrective, { foreignKey: 'userId' });

      // --- เพิ่มการเชื่อมโยงกับ LoginHistory ---
      user.hasMany(models.LoginHistory, { 
        foreignKey: 'userId',
        as: 'loginHistories' // ตั้งชื่อ Alias สำหรับเรียกใช้
      });
    }
  }
  user.init({
    emid: DataTypes.INTEGER, // หรือจะใช้ emid เป็นตัวเชื่อมโยงหลักก็ได้
    idcard: DataTypes.BIGINT,
    password: DataTypes.STRING,
    prefixID: DataTypes.INTEGER,
    fname: DataTypes.STRING,
    lname: DataTypes.STRING,
    divisionID: DataTypes.INTEGER,
    departmentID: DataTypes.INTEGER,
    roleID: DataTypes.INTEGER,
    lastLogin: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'user',
    tableName: 'users',
  });
  return user;
};