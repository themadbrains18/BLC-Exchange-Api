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

const app = express();

dotenv.config();

app.set('views', path.dirname('../') + '/views');
app.set('view engine', 'jade');

var corsOptions = {
  origin: "http://localhost:3000"

};

app.get('/api-blc',(req,res)=>{
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
require("./app/routes/paymentmethod.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
