module.exports = (sequelize, DataTypes) => {
  const Tokens = sequelize.define("token", {
    coinName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status : {
      type : DataTypes.BOOLEAN,
      allowNull: true,
    },
    fullName :{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    minimum_withdraw : {
      type : DataTypes.DOUBLE,
      allowNull: false,
    },
    confirmations: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    decimals: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokenType:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    networks : {
      type : DataTypes.STRING,
      allowNull: false,
    }
  });


  // Tokens.sync().then(() => {
  //   console.log('New table created');
  // }).finally(() => {
  //   sequelize.close();
  // })

  return Tokens;
};
