'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.belongsTo(models.prefix, { foreignKey: 'prefixID' });
      user.belongsTo(models.division, { foreignKey: 'divisionID' });
      user.belongsTo(models.department, { foreignKey: 'departmentID' });
      user.belongsTo(models.role, { foreignKey: 'roleID' });
      user.hasMany(models.training_sessions, { foreignKey: 'userId' } );
      user.hasMany(models.corrective, { foreignKey: 'userId' } );
      
    }
  }
  user.init({
    emid: DataTypes.INTEGER,
    citizenid: DataTypes.BIGINT,
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
  }); 
  return user;
};