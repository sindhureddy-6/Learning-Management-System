'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.belongsTo(models.User, {
        foreignKey: "EducatorId",
      });
      Course.hasMany(models.Chapter, {
        foreignKey: "CourseId",
      });
      Course.hasMany(models.Page, {
        foreignKey: "CourseId",
      });
      Course.hasMany(models.Enrollment, {
        foreignKey: "courseId",
      });
       Course.hasMany(models.Progress, {
        foreignKey: "CourseID",
      });
    }
  }
  Course.init({
    CourseName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};