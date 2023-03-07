module.exports = (sequelize, DataTypes) => {
  const paymentmethod = sequelize.define("payment_method", {
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fields: {
      type: DataTypes.JSON,
      allowNull: false,
    }

  });


  // paymentmethod.sync().then(() => {
  //   console.log('New table created');
  // }).finally(() => {
  //   sequelize.close();
  // })

  return paymentmethod;
};
