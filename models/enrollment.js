'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Enrollment.belongsTo(models.User, { foreignKey: 'userId' });
      Enrollment.belongsTo(models.User, { foreignKey: 'EducatorId'});
      Enrollment.belongsTo(models.Course, { foreignKey: 'courseId' });
      Enrollment.belongsTo(models.Course, { foreignKey: 'courseId' });
    }
    static async getEnrollmentCount(courseId) {
      return await Enrollment.count({ where: { courseId } });
    }
    static async getTotalEnrollments(EducatorId) {
      return await Enrollment.count({ where: { EducatorId },distinct: true });
    }
  }
  Enrollment.init({
    courseId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Enrollment',
  });
  return Enrollment;
};