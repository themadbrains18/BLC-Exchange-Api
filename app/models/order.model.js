

module.exports = (sequelize, DataTypes) => {

    const Order = sequelize.define("order",
        {
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            sell_user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            buy_user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            token_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            price: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            spend_amount: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            receive_amount: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            spend_currency: {
                type: DataTypes.STRING,
                allowNull: false
            },
            receive_currency: {
                type: DataTypes.STRING,
                allowNull: false
            },
            p_method: {
                type: DataTypes.JSON
            },
            isComplete: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            isCanceled: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            inProcess: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            isReleased: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            type: {
                type: DataTypes.STRING,
            },


        },

    );
    // Post.sync().then(() => {
    //     console.log('New table created');
    //   }).finally(() => {
    //     sequelize.close();
    //   })

    return Order;
};
