const db = require("../../models");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const users = db.users;

const { Op } = require("sequelize");

const tokenSecret = 'mdb!@#123psd';


exports.login = async (req, res, next) => {

  const { username, password, dial_code, requestType, otp, time } = req.body;

  try {
    if (requestType === "email") {
      emailLogin(username, password, req, res, next);
    }
    else {
      mobileLogin(username, password, dial_code, req, res, next);
    }
  } catch (error) {
    console.error('====', error)
    return res.send({ status: 500, data: error })
  }
}

const emailLogin = (username, password, req, res, next) => {
  let token = null;
  let Condition = username ? { email: { [Op.like]: username } } : null;
  users.findOne({ where: Condition }).then((result) => {
    if (result) {
      try {
        passport.authenticate('local', (authErr, user, info) => {
          if (authErr) return next(authErr);
          if (!user) {
            return res.send({ status: 401, message: "Email and password not matched!." });
          }
          return req.logIn(user, async (loginErr) => {
            if (loginErr) { console.log(loginErr); return res.sendStatus(401); }
            if (user) {

              token = jwt.sign({ id: user.id }, tokenSecret, { expiresIn: '5h' });
              let session = req.session;
              session.token = token;
              return res.send({ status: 200, id: user.id, auth: true, username: user.username, registerType: user.registerType, 
                number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA,
                 kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret, own_code: user.own_code,UID : user.UID });

            }

          })
        })(req, res, next);
      } catch (error) {
        console.log('===here', error);
      }
    }
    else {
      return res.send({ status: 404, message: 'This Email not exist' });
    }
  }).catch((error) => {
    console.error('===', error);
    res.send({ status: 500, data: error })
  })
}

const mobileLogin = (username, password, dial_code, req, res, next) => {
  try {

    let token = null;
    let Condition = username ? { [Op.and]: [{ number: username }, { dial_code: dial_code }] } : null;
    users.findOne({ where: Condition }).then((result) => {
      if (result) {
        passport.authenticate('sms-local', async (authErr, user, info) => {
          if (authErr) return next(authErr);
          if (!user) {
            return res.send({ status: 401, message: "Number and password not matched!." });
          }

            token = jwt.sign({ _id: user._id }, tokenSecret, { expiresIn: '5h' });
            let session = req.session;
            session.token = token;
            
            return res.send({ status: 200, id: user.id, auth: true, username: user.username, registerType: user.registerType, 
              number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, 
              kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret, own_code: user.own_code,UID : user.UID  });
        })(req, res, next);
      }
      else {
        return res.send({ status: 404, message: 'This Number not exist' });
      }
    }).catch((error) => {
      return res.send({ status: 404, message: error });

    })

  } catch (error) {
    console.error('=====', error);

  }
}

exports.usersList = async (req, res, next) => {

    users.findAll().then(async(result)=>{
            if(result){
                return res.send({ status: 200, data: result });
            }
          }).catch((error)=>{
            console.error('===========', error);
          })
    
  }
  

