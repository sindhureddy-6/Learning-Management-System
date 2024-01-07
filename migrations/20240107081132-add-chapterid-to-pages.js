'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Pages', 'ChapterID', {
      type: Sequelize.INTEGER,
      allowNull: false, 
      references: {
        model: 'Chapters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Pages', 'ChapterID');
  }
};
