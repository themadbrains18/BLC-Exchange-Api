module.exports = (sequelize, DataTypes) => {
    const Withdraws = sequelize.define("withdraw", {
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      tokenName :{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      withdraw_wallet :{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      amount : {
        type : DataTypes.DOUBLE,
        allowNull: false,
      },
      status:{
        type: DataTypes.BOOLEAN
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tx_hash : {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tx_type : {
        type: DataTypes.STRING,
        allowNull: true,
      },
    requestedAmount:{
        type : DataTypes.DOUBLE,
        allowNull: false,
    },
    fee:{
        type : DataTypes.DOUBLE,
        allowNull: true,
    },
    networkId:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    type:{
        type: DataTypes.STRING,
        allowNull: false,
    }

    });
  
  
    // Withdraws.sync().then(() => {
    //   console.log('New table created');
    // }).finally(() => {
    //   sequelize.close();
    // })
  
    return Withdraws;
  };
  