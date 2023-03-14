

module.exports = (sequelize, DataTypes) => {

    const Notification = sequelize.define("notification",
        {
            sender: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            receiver: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            orderid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false,
            },

        },

    );
    // Notification.sync().then(() => {
    //     console.log('New table created');
    //   }).finally(() => {
    //     sequelize.close();
    //   })

    return Notification;
};
