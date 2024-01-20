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
      });

    }
    static async MarkedAsComplete(userId, PageId) {
      let p = await Progress.findOne({ where: { StudentID: userId, PageID: PageId } });
      if (p) {
        return p.IsComplete;
      } else {
        return false;
      }
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