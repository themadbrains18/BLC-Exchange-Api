const db = require("../models");
var speakeasy = require("speakeasy");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const users = db.users;
const userOtp = db.userotp;
const { Op } = require("sequelize");
const { storeWalletAddress } = require('./common.controller');
var generator = require('generate-password');
const tokenSecret = 'mdb!@#123psd';

// ===================================================================
// ================API Request Register New user =====================
// ===================================================================
exports.register = async (req, res) => {
  const { email, number, password, dial_code, requestType, referal_code, otp, time } = req.body
  var secret = speakeasy.generateSecret({ length: 20 });
  var own_refer_code =  generator.generate({
    length: 8,
    numbers: true
  });
  try {
    let ifUser;

    let otpuser = requestType == 'email' ? email : number;
    var otpCondition = otpuser ? { [Op.and]: [{ username: otpuser }, { otp: otp }] } : null;

    userOtp.findOne({ where: otpCondition }).then(async (result) => {
      if (result) {
        let addMin = 5;
        if (new Date(result.createdAt).getTime() + addMin * 60000 > new Date(time).getTime()) {
          if (requestType == 'email') {
            var condition = email ? { email: { [Op.like]: email } } : null;
            users.findOne({ where: condition }).then(async (result) => {
              if (result) {
                return res.send({ status: 409, message: "This email is already exist" });
              }
              else {
                let bcryptPassword = bcrypt.hashSync(password, 12);

                users.create({ email: email, passwordHash: bcryptPassword, registerType: requestType, own_code: own_refer_code, refeer_code: referal_code, secret: JSON.stringify(secret) }).then(async (data) => {
                  if (data) {
                    // console.log(data)
                    setTimeout(() => {
                      let wallet = storeWalletAddress(data.id);
                    }, 1000);
                    return res.send({ status: 200, message: "You are register succssfully!", data });
                  }
                }).catch((e) => {
                  console.log(e);
                  return res.send({ status: 500, message: "Something Wrong!!!", e });
                })
              }
            })
          }
          else {
            var condition = number ? { number: { [Op.like]: number } } : null;
            ifUser = users.findOne({ where: condition }).then(async (result) => {
              if (result) {
                return res.send({ status: 409, message: "This number is already exist" });
              }
              else {
                let bcryptPassword = bcrypt.hashSync(password, 12); //bcrypt random password that store in DB
                users.create({ number: number, dial_code: dial_code, passwordHash: bcryptPassword, registerType: requestType, own_code: own_refer_code, refeer_code: referal_code, secret: JSON.stringify(secret) }).then(async (data) => {
                  if (data) {
                    // console.log(data)
                    setTimeout(() => {
                      let wallet = storeWalletAddress(data.id);
                    }, 1000);
                    return res.send({ status: 200, message: "You are register succssfully!", data });
                  }
                }).catch((e) => {
                  console.log(e);
                  return res.send({ status: 500, message: "Something Wrong!!!", e });
                })
              }
            })
          }
        }
        else {
          // console.log('OTP Expire')
          return res.send({ status: 404, message: 'OTP Expired' })
        }
      }
      else {
        // console.log('OTP Not Matched')
        return res.send({ status: 404, message: 'OTP Not Matched' })
      }

    }).catch((error) => {
      console.log(error);
      return res.send({ status: 500, data: error })
    })

  } catch (error) {
    console.log(error)
    return res.send({ status: 500, message: error });
  }
}

// ===================================================================
// ================API Request Login user ============================
// ===================================================================
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
            token = jwt.sign({ id: user.id }, tokenSecret, { expiresIn: '5h' });
            let session = req.session;
            session.token = token;
            return res.send({ status: 200, id: user.id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret, own_code: user.own_code });
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
          return res.send({ status: 200, id: user.id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret, own_code: user.own_code });
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

exports.checkUser = async (req, res) => {
  const { email, number, dial_code, requestType } = req.body;
  if (requestType === 'email') {
    var condition = email ? { email: { [Op.like]: email } } : null;
    users.findOne({ where: condition }).then(async (result) => {
      if (result) {
        res.send({ status: 200, message: 'User Already Exist' })
      }
      else {
        res.send({ status: 404, message: 'User Not Exist' })
      }
    }).catch((error) => {
      console.error('===', error);
    })
  }
  else {
    var condition = number ? { [Op.and]: [{ number: number }, { dial_code: dial_code }] } : null;
    users.findOne({ where: condition }).then(async (result) => {
      if (result) {
        res.send({ status: 200, message: 'User Already Exist' })
      }
      else {
        res.send({ status: 404, message: 'User Not Exist' })
      }
    }).catch((error) => {
      console.error('===', error);
    })
  }

}


exports.updateUser = (req, res) => {
  try {
    users.findOne({ where: { id: req.body.id } }).then((record) => {
      if (record) {
        record.update(req.body).then((updateRecord) => {
          if (updateRecord) {
            res.status(200).send({ status: 200, data: record });
          }
        }).catch((error) => {
          res.status(500).send({ message: error });
        })
      }
      else {
        res.status(401).send({ message: 'not found' });
      }
    }).catch((error) => {
      console.error('=========', error);
      res.status(500).send({ message: error });
    })
  } catch (error) {
    console.error('=========', error);
    res.status(500).send({ message: error });
  }
}

exports.verifyGoogleAuth = (req, res) => {
  const { secret, token } = req.body;
  try {
    console.log(secret, token);
    const { base32, hex } = secret;
    const isVerified = speakeasy.totp.verify({
      secret: base32,
      encoding: "base32",
      token: token
    });

    console.log("isVerified -->", isVerified);

    return res.send({ status: 200, message: isVerified })
  } catch (error) {

  }
}