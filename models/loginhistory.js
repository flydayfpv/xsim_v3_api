'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    static associate(models) {
      // --- เชื่อมโยงกลับไปที่ User ---
      LoginHistory.belongsTo(models.user, { 
        foreignKey: 'userId',
        as: 'operator' 
      });
    }
  }
  LoginHistory.init({
    // แนะนำให้ userId ตรงกับประเภทข้อมูลใน User (ถ้า emid เป็น Integer ตัวนี้ควรเป็น Integer)
    userId: {
      type: DataTypes.STRING, // หรือ DataTypes.INTEGER ตามหน้างาน
      allowNull: false
    },
    hwid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // เก็บ Face Encodings 128 มิติจาก Python ในรูปแบบ JSON String
    faceVector: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    loginAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'LoginHistory',
    timestamps: false // ใช้ loginAt แทน createdAt/updatedAt ได้เลย
  });
  return LoginHistory;
};