

module.exports = (sequelize, DataTypes) => {

    const Kyc = sequelize.define("kyc",
        {
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
              },
            country: {
                type: DataTypes.STRING,
                defaultValue: ''
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            lname: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
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
            phone: {
                type: DataTypes.STRING
            },
            createdAt: {
                type: DataTypes.DATE
            },
            updatedAt: {
                type: DataTypes.DATE
            }
        },

    );



    return Kyc;
};
