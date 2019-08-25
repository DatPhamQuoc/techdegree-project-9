const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    userId: Sequelize.INTEGER,
    title: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: true,
      }
    },
    description: {
      type: Sequelize.TEXT,
      validate: {
        notEmpty: true
      }
    },
    estimatedTime: {
      type: Sequelize.STRING,
      allowNull: true
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true
    },
    userId: Sequelize.INTEGER,
  }, { sequelize });

  Course.associate = (models) => {
    Course.hasOne(models.User)
  };
  return Course;
};
