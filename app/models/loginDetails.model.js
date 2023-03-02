

module.exports = (sequelize, DataTypes) => {

    const LoginDetails = sequelize.define("loginDetail",
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            loginTime: {
                type: DataTypes.DATE
            },
            lastLogin: {
                type: DataTypes.DATE
            }
        },

    );
    // LoginDetails.sync().then(() => {
    //     console.log('New table created');
    //   }).finally(() => {
    //     sequelize.close();
    //   })

    return LoginDetails;
};
