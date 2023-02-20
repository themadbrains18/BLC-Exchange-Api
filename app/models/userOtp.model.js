module.exports = (sequelize, DataTypes) => {
  const UserOtp = sequelize.define("userotp", {
    username:{
      type: DataTypes.STRING,
      required: true,
      trim: true,
    },
    otp: {
      type: DataTypes.STRING,
      required: true,
      trim: true,
    },
  });

  return UserOtp;
};
