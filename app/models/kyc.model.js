

module.exports = (sequelize, DataTypes) => {

    const Kyc = sequelize.define("kyc",
        {
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique:true
            },
            country: {
                type: DataTypes.STRING,
                defaultValue: ''
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            doctype: {
                type: DataTypes.STRING,
                allowNull: false
            },
            docnumber: {
                type: DataTypes.STRING,
                allowNull: false
            },
            dob: {
                type: DataTypes.DATE
            },
            idfront: {
                type: DataTypes.STRING
            },
            idback: {
                type: DataTypes.STRING
            },
            statement: {
                type: DataTypes.STRING
            },
            createdAt: {
                type: DataTypes.DATE
            },
            updatedAt: {
                type: DataTypes.DATE
            },
            isVerified : {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            }
        },

    );
    // Kyc.sync().then(() => {
    //     console.log('New table created');
    //   }).finally(() => {
    //     sequelize.close();
    //   })

    return Kyc;
};
