module.exports = (sequelize, DataTypes) => {
  const Networks = sequelize.define("network", {
    networkName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    network: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chainId :{
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });


  // Networks.sync().then(() => {
  //   console.log('New table created');
  // }).finally(() => {
  //   sequelize.close();
  // })

  return Networks;
};
