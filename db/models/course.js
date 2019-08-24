const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    userId: Sequelize.STRING,
    title: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: true,
        isEmail: true
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
    }
  }, { sequelize });

  Course.associate = (models) => {
    Course.belongTo(models.User);
  };
  return Course;
};
