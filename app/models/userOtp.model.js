module.exports = (sequelize, DataTypes) => {
  const UserOtp = sequelize.define("userotp", {
    username:{
      type: DataTypes.STRING,
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  return UserOtp;
};
