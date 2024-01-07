'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Chapters', 'Description', {
      type: Sequelize.TEXT,
      allowNull:false, // Adjust as needed based on your requirements
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Chapters', 'Description', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  }
};
