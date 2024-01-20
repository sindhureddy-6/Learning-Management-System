'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Progress.init({
    StudentID: DataTypes.INTEGER,
    CourseID: DataTypes.INTEGER,
    PageID: DataTypes.INTEGER,
    IsComplete: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Progress',
  });
  return Progress;
};