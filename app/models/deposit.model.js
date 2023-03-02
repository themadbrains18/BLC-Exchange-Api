module.exports = (sequelize, DataTypes) => {
    const Deposits = sequelize.define("deposit", {
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coinName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        network: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tx_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blockHeight: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        successful: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    // Deposits.sync().then(() => {
    //   console.log('New table created');
    // }).finally(() => {
    //   sequelize.close();
    // })

    return Deposits;
};
