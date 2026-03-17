'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class correctiveLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
    static associate(models) {
      // define association here
      correctiveLog.belongsTo(models.corrective, { foreignKey: 'correctiveId' });
    }
  }
  correctiveLog.init({
    correctiveId: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    hits: DataTypes.INTEGER,
    fars: DataTypes.INTEGER,
    hitsRate: DataTypes.DECIMAL,
    time_used: DataTypes.INTEGER,
    category_stats: DataTypes.TEXT,
    wrong_answers: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'correctiveLog',
  });
  return correctiveLog;
};