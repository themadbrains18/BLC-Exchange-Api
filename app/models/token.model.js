module.exports = (sequelize, DataTypes) => {
  const Tokens = sequelize.define("token", {
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fullName :{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    address :{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    minimum_withdraw : {
      type : DataTypes.DOUBLE,
      allowNull: false,
    },
    decimals: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenType:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status : {
      type : DataTypes.BOOLEAN,
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
