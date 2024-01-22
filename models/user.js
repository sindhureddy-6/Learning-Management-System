'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       User.hasMany(models.Course, {
        foreignKey: "EducatorId",
       });
      User.hasMany(models.Enrollment, {
        foreignKey: "userId",
      });
      User.hasMany(models.Enrollment, {
        foreignKey: "EducatorId",
      });
      User.hasMany(models.Progress, {
        foreignKey: "StudentID",
      });
    }
  }
  User.init({
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    "Email": {
      type: DataTypes.STRING,
      allowNull: false
    },
    "Password": {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('Educator', 'Student'),
      allowNull: false
    }
  },
   {
    sequelize,
    modelName: 'User',
  });
  return User;
};