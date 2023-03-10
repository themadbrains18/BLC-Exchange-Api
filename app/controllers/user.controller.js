const db = require("../models");
var speakeasy = require("speakeasy");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const users = db.users;
const userOtp = db.userotp;
const loginDetails = db.loginDetail
const { Op } = require("sequelize");
const { storeWalletAddress, sendResetEmail, phoneotp,emailotp } = require('./common.controller');
var generator = require('generate-password');
const tokenSecret = 'mdb!@#123psd';
var moment = require('moment');

const createRandomNumber = (length, numbers, lowercase, uppercase) => {
  return generator.generate({
    length: length,
    numbers: true,
    lowercase: lowercase,
    uppercase: uppercase
  })
}

// ===================================================================
// ================API Request Register New user =====================
// ===================================================================
exports.register = async (req, res) => {
  const { email, number, password, dial_code, requestType, referal_code, otp, time } = req.body
  var secret = speakeasy.generateSecret({ length: 20 });
  var own_refer_code = generator.generate({
    length: 8,
    numbers: true,
    uppercase: true,
    lowercase: false
  });

  var uuid = generator.generate({
    length: 8,
    numbers: true,
    uppercase: false,
    lowercase: false
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

                users.create({ email: email, passwordHash: bcryptPassword, registerType: requestType, own_code: own_refer_code, refeer_code: referal_code, secret: JSON.stringify(secret), UID : uuid }).then(async (data) => {
                  if (data) {
                    // console.log(data)
                    let result = await saveLoginDetails(data.id)
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
                users.create({ number: number, dial_code: dial_code, passwordHash: bcryptPassword, registerType: requestType, own_code: own_refer_code, refeer_code: referal_code, secret: JSON.stringify(secret),UID : uuid }).then(async (data) => {
                  if (data) {
                    // console.log(data)
                    let result = await saveLoginDetails(data.id)
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
            if (user) {

              token = jwt.sign({ id: user.id }, tokenSecret, { expiresIn: '5h' });
              let result = saveLoginDetails(user.id)
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
          let result = await saveLoginDetails(user.id)

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

// ===================================================================
// ================Check user exist or not Request Login user ============================
// ===================================================================
exports.checkUser = async (req, res) => {
  const { email, number, dial_code, requestType } = req.body;
  if (email !== '') {
    var condition = email ? { email: { [Op.like]: email } } : null;
    users.findOne({ where: condition }).then(async (result) => {
      if (result) {
        res.send({ status: 200, message: 'This Email is already exist.Please choose another email.' })
      }
      else {
        res.send({ status: 404, message: 'User Not Exist' })
      }
    }).catch((error) => {
      console.error('===', error);
    })
  }
  else {
    console.log(dial_code,'=====here dial code')
    var condition = number ? { [Op.and]: [{ number: number }, { dial_code: dial_code }] } : null;
    users.findOne({ where: condition }).then(async (result) => {
      if (result) {
        res.send({ status: 200, message: 'This Number is already exist.Please choose another number.' })
      }
      else {
        res.send({ status: 404, message: 'User Not Exist' })
      }
    }).catch((error) => {
      console.error('===', error);
    })
  }

}

// ===================================================================
// ====user authenticate everytime Request Login user ================
// ===================================================================
exports.userAuthenticate = async (req, res) => {
  const { email, number, dial_code } = req.body;
  if (email !== '') {
    var condition = email ? { email: { [Op.like]: email } } : null;
    users.findOne({ where: condition, attributes: { exclude: ['createdAt', 'updatedAt', 'passwordHash', 'bep20Address', 'trc20Address', 'bep20Hashkey', 'trc20Hashkey'] } }).then(async (result) => {
      if (result) {
        await loginDetails.findOne({ where: { user_id: result.id } }).then(async(detail) => {
          if (detail) {
            // let result =  await fetch("https://api.ipregistry.co/?key=kudsv65pr7068fv5") .then(response => response.text())
            // console.log("=========result", result)
            let date = moment(detail.lastLogin).format('MMMM Do YYYY, h:mm:ss a');
            res.send({ status: 200, data: result, lastLogin : date });
          }
        })
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
    users.findOne({ where: condition, attributes: { exclude: ['createdAt', 'updatedAt', 'passwordHash', 'bep20Address', 'trc20Address', 'bep20Hashkey', 'trc20Hashkey'] } }).then(async (result) => {
      if (result) {
        await loginDetails.findOne({ where: { user_id: result.id } }).then((detail) => {
          if (detail) {
            let date = moment(detail.lastLogin).format('MMMM Do YYYY, h:mm:ss a');
            res.send({ status: 200, data: result, lastLogin : date })

          }
        })
      }
      else {
        res.send({ status: 404, message: 'User Not Exist' })
      }
    }).catch((error) => {
      console.error('===', error);
    })
  }
}
// ===================================================================
// ====update user Request Login user ================
// ===================================================================
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

// ===================================================================
// ====Google Authentication code verifiy Request Login user ================
// ===================================================================
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

// ===================================================================
// ====user password update Request Login user ================
// ===================================================================

exports.updatePassword = async (req, res) => {
  const { newpassword,email,id } = req.body;
  
  var condition = email ? { email: { [Op.like]: email } } : { id: { [Op.like]: id } };
  users.findOne({  where: condition  }).then((user) => {
    if (user) {
      let bcryptPassword = bcrypt.hashSync(newpassword, 12);
      user.update({ passwordHash: bcryptPassword }).then((updateRecord) => {
        if (updateRecord) {
          res.send({ status: 200, data: updateRecord });
        }
      }).catch((error) => {
        res.send({ status: 500, data: error })
      })
    }
  }).catch((error) => {
    console.error('====', error);
    return res.send({ status: 404, data: error });
  })

}

// ===================================================================
// ====user Login Details update Request Login user ================
// ===================================================================

const saveLoginDetails = async (id) => {
  loginDetails.findOne({ where: { user_id: id } }).then((userDetail) => {
    if (userDetail) {
      userDetail.update({ loginTime: Date.now(), lastLogin: userDetail.loginTime }).then((updateRecord) => {
        if (updateRecord) {
          return updateRecord
        }
      }).catch((error) => {
        console.log("=====error1", error)
      })
    }

    else {
      data = loginDetails.create({ user_id: id, loginTime: Date.now(), lastLogin: Date.now() }).then((updateRecord) => {
        if (updateRecord) {
          return updateRecord
        }
      }).catch((error) => {
        console.log("=====error2", error)
      })
    }

  }).catch((error) => {
    console.error('====', error);

  })

}

// ===================================================================
// ====user password confirm matched ================
// ===================================================================
exports.confirmPassword = async (req, res) => {
  const { oldpassword } = req.body;

  var isValidPassword = function (userpass, password) {
    return bcrypt.compareSync(password, userpass);
  }
  users.findOne({ where: { id: req.body.id } }).then((user) => {
    if (user) {
      if (!isValidPassword(user.passwordHash, oldpassword)) {
        res.send({ status: 401, message: 'Old Password not matched' });
      }
      else {
        res.send({ status: 200, message: 'Password matched' });
      }
    }
  }).catch((error) => {
    console.error('====', error);
    return res.send({ status: 200, data: error });
  })
}

// ===================================================================
// ====user fund code confirm matched ================
// ===================================================================
exports.confirmFuncode = async (req, res) => {
  const { oldcode } = req.body;

  users.findOne({ where: { id: req.body.id } }).then((user) => {
    if (user) {
      if (user.tradingPassword !== oldcode) {
        res.send({ status: 401, message: 'Old Fun Code Not Matched' });
      }
      else {
        res.send({ status: 200, message: 'Fun Code Matched' });
      }
    }
  }).catch((error) => {
    console.error('====', error);
    return res.send({ status: 200, data: error });
  })
}

// ===================================================================
// ====user delete confirm matched ================
// ===================================================================
exports.removeUser = async (req, res) => {
  console.log(req.params.id)
  try {
    await users.destroy({ where: { id: parseInt(req.params.id) } }).then((remove) => {
      if (remove) {
        res.send({ status: 200, message: 'Account delete successfully.You have not access this account before again created.' })
      }
      else {
        res.send({ status: 200, message: 'No account found' })
      }
    }).catch((error) => {
      res.send({ status: 500, data: error });
    });
  } catch (error) {
    res.send({ status: 500, data: error });
  }
}

exports.depositAddress = async (req, res) => {
  try {
    users.findOne({ where: { id: req.params.id } }).then((user) => {
      if (user) {
        let address = req.params.type === 'bep20' ? user.bep20Address : req.params.type === 'erc20' ? user.bep20Address : user.trc20Address;
        console.log(address);
        res.send({ status: 200, deposit_address: address })
      }
    }).catch((error) => {
      console.error('=========', error);
      res.send({ status: 500, data: error });
    })
  } catch (error) {

  }
}

exports.userExist = async (req, res,next) => {
  const { username, dial_code, requestType } = req.body;
  if (requestType !== 'mobile') {
    var condition = username ? { email: { [Op.like]: username } } : null;
    users.findOne({ where: condition }).then(async (result) => {
      if (result) {
        let otp = createRandomNumber(6, true, false, false);
        let reset = true;
        let sendOtp =  await emailotp(username, otp,reset, res);
        res.send({ status: 200, data: result })
      // let response=  await sendResetEmail(username,res)
      // if(response){
      //   res.status(200).send({ status: 200, data:response })
      // }
           
      }
      else {
        res.send({ status: 404, message: 'This email does not exist. Please enter the correct one.' })
      }
    }).catch((error) => {
      console.error('===', error);
    })
  }
  else {
    console.log(dial_code,'=====here dial code')
    var condition = username ? { [Op.and]: [{ number: username }, { dial_code: dial_code }] } : null;
    users.findOne({ where: condition }).then(async (result) => {
      if (result) {
    
        let otp = createRandomNumber(6, true, false, false);
        let reset = true;
        let sendOtp =  await phoneotp(username, otp, dial_code,reset, res);
        res.send({ status: 200, data: result })

        // console.log(sendOtp,'====here sendOtp')
        // if(sendOtp === true){
        //   res.send({ status: 200, data: result })
        // }
        
      }
      else {
        res.send({ status: 404, message: 'This phone number does not exist. Please enter the correct one.' })
      }
    }).catch((error) => {
      console.error('===', error);
    })
  }

}

