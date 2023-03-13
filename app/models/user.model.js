const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define("user",
        {
            number: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull :true
            },
            email: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull :true
            },
            dial_code: {
                type: DataTypes.INTEGER
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false
            },
            bep20Address: {
                type: DataTypes.STRING
            },
            bep20Hashkey: {
                type: DataTypes.STRING
            },
            trc20Address: {
                type: DataTypes.STRING
            },
            trc20Hashkey: {
                type: DataTypes.STRING
            },
            TwoFA: {
                type: DataTypes.STRING,
                defaultValue: 'disable'
            },
            kycstatus: {
                type: DataTypes.ENUM,
                values: ['NA','success', 'pending', 'reject'],
                allowNull: true,
                defaultValue: 'NA'
            },
            tradingPassword: {
                type: DataTypes.STRING,
                defaultValue: "",
            },
            statusType: {
                type: DataTypes.STRING,
                defaultValue: 'On Hold',
            },
            registerType: {
                type: DataTypes.STRING
            },
            role: {
                type: DataTypes.STRING
            },
            secret: {
                type: DataTypes.STRING
            },
            own_code: {
                type: DataTypes.STRING
            },
            refeer_code: {
                type: DataTypes.STRING,
            },
            antiphishing: {
                type: DataTypes.STRING,
            },
            createdAt: {
                type: DataTypes.DATE
            },
            updatedAt: {
                type: DataTypes.DATE
            },
            UID : {
                type : DataTypes.INTEGER,
                allowNull: false,
            }
        },

        {
            instanceMethods: {
                validPassword: (password) => {
                    console.log(password, this.passwordHash)
                    return bcrypt.compareSync(password, this.passwordHash);
                }
            }
        });

    // User.sync().then(() => {
    //     console.log('New table created');
    // }).finally(() => {
    //     sequelize.close();
    // })

    return User;
};
