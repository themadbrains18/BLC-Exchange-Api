const dbConfig = require("../config/db.config.js");

const {Sequelize ,Model, Op , DataTypes } = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,

  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tutorials = require("./tutorial.model.js")(sequelize, DataTypes);
db.users = require('./user.model.js')(sequelize, DataTypes);
db.userotp = require('./userOtp.model.js')(sequelize, DataTypes);
db.assets = require('./assets.model.js')(sequelize, DataTypes);
db.tokens = require('./token.model.js')(sequelize, DataTypes);
db.networks = require('./network.model.js')(sequelize, DataTypes);
db.kyc = require('./kyc.model.js')(sequelize, DataTypes);
db.deposit = require('./deposit.model.js')(sequelize, DataTypes);
db.transferhistory = require('./transferhistory.model')(sequelize, DataTypes);
db.loginDetail = require('./loginDetails.model')(sequelize, DataTypes);
db.posts = require('./post.model.js')(sequelize, DataTypes);
db.withdraws = require('./withdraw.model.js')(sequelize, DataTypes);
db.paymentmethod = require('./paymentMethod.model.js')(sequelize, DataTypes);
db.userpaymentmethod = require('./users_payment_methods.model.js')(sequelize, DataTypes);

db.marketorder = require('./marketorder.model.js')(sequelize,DataTypes);
db.orders = require('./order.model.js')(sequelize, DataTypes);
db.chats = require('./chat.model.js')(sequelize, DataTypes);
db.notifications = require('./notification.model.js')(sequelize, DataTypes);
//  db.sequelize.sync({ force: true }); 
//  db.withdraws.sync({ force: true }); 
//  db.paymentmethod.sync({ force: true }); 
//  db.userpaymentmethod.sync({ force: true }); 
//  db.marketorder.sync({ force: true }); 



//  db.tokens.sync({ force: true }); 
//  db.posts.sync({ force: true }); 
//  db.notifications.sync({ force: true }); 
   
module.exports = db;
