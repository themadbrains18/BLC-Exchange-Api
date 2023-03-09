module.exports = (sequelize, DataTypes) => {
    const userpaymentmethod = sequelize.define("userpaymentmethod", {
        user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pmid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ['active', 'hold'],
        allowNull: false,
      },
      pm_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pmObject: {
        type: DataTypes.JSON,
        allowNull: false,
      }
  
    });
  
  
    // paymentmethod.sync().then(() => {
    //   console.log('New table created');
    // }).finally(() => {
    //   sequelize.close();
    // })
  
    return userpaymentmethod;
  };
  