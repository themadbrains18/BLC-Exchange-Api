const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const passport = require('passport');  // authentication
const LocalStrategy = require("passport-local").Strategy;
const db = require("./app/models");
const users = db.users;
const { Op } = require("sequelize");
const cron = require("node-cron");

const app = express();

dotenv.config();

app.set('views', path.dirname('../') + '/views');
app.set('view engine', 'jade');

var corsOptions = {
  origin: ["http://localhost:3000","http://localhost:3001"]

};

app.get('/api',(req,res)=>{
  res.send('Hello Welcome BLC API')
})

app.use(cors(corsOptions));
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));

const local = new LocalStrategy(async (username, password, done) => {
  try {
    var condition = username ? { email: { [Op.like]: username } } : null;
    var isValidPassword = function (userpass, password) {
      return bcrypt.compareSync(password, userpass);
    }
    users.findOne({ where: condition })
      .then(user => {
        if (!user) {
          return done(null, false, {
            message: 'Email does not exist'
          });
        }
        if (!isValidPassword(user.passwordHash, password)) {
          return done(null, false, {
            message: 'Incorrect password.'
          });
        }
        return done(null, user);
      })
      .catch(e => done(e));
  } catch (error) {
    return done(error, false);
  }

});

const Smslocal = new LocalStrategy(async (username, password, done) => {
  try {
    var condition = username ? { number: { [Op.like]: username } } : null;
    var isValidPassword = function (userpass, password) {
      return bcrypt.compareSync(password, userpass);
    }
    users.findOne({ where: condition })
      .then(user => {
        
        if (!user) {
          return done(null, false, {
            message: 'Email does not exist'
          });
        }
        if (!isValidPassword(user.passwordHash, password)) {
          return done(null, false, {
            message: 'Incorrect password.'
          });
        }
        return done(null, user);
      })
      .catch(e => done(e));
  } catch (error) {
    return done(error, false);
  }

});

passport.use('local', local);
passport.use('sms-local', Smslocal);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/turorial.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/comman.routes")(app);
require("./app/routes/token.routes")(app);
require("./app/routes/assets.routes")(app);
require("./app/routes/kyc.routes")(app);
require("./app/routes/network.routes")(app);
require("./app/routes/withdraw.routes")(app);
require("./app/routes/deposit.routes")(app);
require("./app/routes/post.routes")(app);
require("./app/routes/paymentmethod.routes")(app);
require("./app/routes/marketorder.routes")(app);

require("./app/routes/order.routes")(app);
require("./app/routes/chat.routes")(app);

const { cronMarketBuySell } = require('./app/controllers/marketorder.controller.js');

// cron.schedule("*/30 * * * * *", function() {
//   cronMarketBuySell()
// });

require("./app/dashboard/routes/user.routes")(app);
require("./app/dashboard/routes/token.routes")(app);
require("./app/dashboard/routes/kyc.routes")(app);
require("./app/dashboard/routes/deposit.routes")(app);
require("./app/dashboard/routes/withdraw.routes")(app);
require("./app/dashboard/routes/payment.routes")(app);

const { socketOrder } = require("./app/controllers/order.controller");
const {socketChat} = require("./app/controllers/chat.controller");
const {socketMarket} = require("./app/controllers/marketorder.controller")

const server = require('http').createServer(app);

const io = require('socket.io')(server, {cors: {origin :'http://localhosst:3000',methods:["GET","POST"]}});

io.on('connection', socket => {
  
  socket.on("order", function(body){
    socketOrder(body.orderid, socket);
  })

  socket.on("chat", function(body){
    socketChat(socket,body);
  })

  socket.on("market", function(body){
    console.log(body,'market body')
    socketMarket(socket,body);
  })
  
});

// set port, listen for requests
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
