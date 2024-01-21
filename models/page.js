'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Page.belongsTo(models.Course, {
        foreignKey: "CourseId",
      });
      Page.belongsTo(models.Chapter, {
        foreignKey: "ChapterID",
      });
      Page.hasMany(models.Progress, {
        foreignKey: "PageID",
      });
    }
    static async getPagesInCourse(courseId) {
      const pages = await Page.findAll({ where: { CourseId: courseId } });
      return pages.length;
    }
  }
  Page.init({
    PageName: DataTypes.STRING,
    Content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Page',
  });
  return Page;
};