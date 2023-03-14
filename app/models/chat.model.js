

module.exports = (sequelize, DataTypes) => {

    const Chat = sequelize.define("chat",
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
            orderid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            chat: {
                type: DataTypes.JSON,
                allowNull: false
            }

        },

    );
    // Chat.sync().then(() => {
    //     console.log('New table created');
    //   }).finally(() => {
    //     sequelize.close();
    //   })

    return Chat;
};
