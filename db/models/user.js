const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    firstName: {
      type:Sequelize.STRING,
      allowNull: false,
      validate: {
        is: ["^[a-z]+$",'i'],
        notEmpty: true
      }
    },
    lastName: {
      type:Sequelize.STRING,
      allowNull: false,
      validate: {
        is: ["^[a-z]+$",'i'],
        notEmpty: true
      }
    },
    emailAddress: {
      type:Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type:Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course,{
      foreignKey:{
        fieldName:'userId',
        allowNull:false,
      }
    })
  };
  return User;
};
