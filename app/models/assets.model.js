module.exports = (sequelize, DataTypes) => {
  const UserAssets = sequelize.define("assets", {
    userID:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    walletType :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    token_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance:{
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  });


  // UserAssets.sync().then(() => {
  //   console.log('New table created');
  // }).finally(() => {
  //   sequelize.close();
  // })

  return UserAssets;
};
