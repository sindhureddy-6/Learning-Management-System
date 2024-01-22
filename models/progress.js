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
      Progress.belongsTo(models.User, {
        foreignKey: "StudentID",
      });
      Progress.belongsTo(models.Course, {
        foreignKey: "CourseID",
      });
      Progress.belongsTo(models.Page, {
        foreignKey: "PageID",
         as: "Page",
      });
      Progress.belongsTo(models.Enrollment, {
        foreignKey: "enrollmentId",
      });

    }
    static async MarkedAsComplete(userId, PageId) {
      let pro = await Progress.findOne({ where: { StudentID: userId, PageID: PageId } });
      if (pro) {
        return pro.IsComplete;
      } else {
        return false;
      }
    }
    static async getCompletionProgress(models,userId, courseId) {
      const totalPagesInCourse = await models.Page.getPagesInCourse(courseId);
      const completedPages = await Progress.findAll({ where: { StudentID: userId, CourseID: courseId } });
      let status;
      if (totalPagesInCourse > 0) {
        status = Math.floor((completedPages.length / totalPagesInCourse) * 100);
      } else {
      status = 0; 
      }
     return status;
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