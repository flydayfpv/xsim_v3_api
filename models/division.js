'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class division extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      division.belongsTo(models.company, { foreignKey: 'companyID' });
    }
  }
  division.init({
    name: DataTypes.STRING,
    companyID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'division',
  });
  return division;
};