module.exports = (sequelize, DataTypes) => {
    const Withdraws = sequelize.define("withdraw", {
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tokenName :{
        type: DataTypes.STRING,
        allowNull: false,
      },
      tokenID :{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      withdraw_wallet :{
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount : {
        type : DataTypes.DOUBLE,
        allowNull: false,
      },
      status:{
        type:   DataTypes.ENUM,
        values: ['success', 'pending', 'cancel']

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
  