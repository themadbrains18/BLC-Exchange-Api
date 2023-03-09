module.exports = (sequelize, DataTypes) => {
  const MarketOrder = sequelize.define("marketorder", {
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tokenid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    market_type:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    order_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    limit_usdt :{
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    volume_usdt:{
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    token_amount:{
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    status:{
      type : DataTypes.BOOLEAN,
      default :false
    },
    isCanceled:{
      type : DataTypes.BOOLEAN,
      default :false
    }
  });


  // MarketOrder.sync().then(() => {
  //   console.log('New table created');
  // }).finally(() => {
  //   sequelize.close();
  // })

  return MarketOrder;
};
