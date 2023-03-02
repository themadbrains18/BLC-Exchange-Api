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
db.withdraws = require('./withdraw.model.js')(sequelize, DataTypes);
//  db.sequelize.sync({ force: true }); 
//  db.withdraws.sync({ force: true }); 
   
module.exports = db;
