'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Chapters', 'CourseId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chapters', 'CourseId');
  }
};
