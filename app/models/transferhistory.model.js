module.exports = (sequelize, DataTypes) => {
  const TransferAssets = sequelize.define("TransferAssetHistory", {
    userID:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    token_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    balance:{
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  });

  // TransferAssets.sync().then(() => {
  //   console.log('New table created');
  // }).finally(() => {
  //   sequelize.close();
  // })

  return TransferAssets;
};
