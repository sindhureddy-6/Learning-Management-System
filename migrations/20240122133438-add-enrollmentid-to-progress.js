'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Progresses', 'enrollmentId', {
      type: Sequelize.INTEGER,
      allowNull: true, 
      references: {
        model: 'Enrollments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Progresses', 'enrollmentId');
  }
};
