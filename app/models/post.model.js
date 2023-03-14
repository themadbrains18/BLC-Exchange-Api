

module.exports = (sequelize, DataTypes) => {

    const Post = sequelize.define("post",
        {
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING,
                defaultValue: ''
            },
            price: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            min_limit: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            max_limit: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            p_method: {
                type: DataTypes.JSON
            },
            payment_time: {
                type: DataTypes.STRING
            },
            notes: {
                type: DataTypes.STRING
            },
            checked: {
                type: DataTypes.BOOLEAN
            }
        },

    );
    // Post.sync().then(() => {
    //     console.log('New table created');
    //   }).finally(() => {
    //     sequelize.close();
    //   })

    return Post;
};
