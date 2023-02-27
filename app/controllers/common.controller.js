const express = require("express");
const path = require('path');
const db = require("../models");
const { Op } = require("sequelize");
const mailer = require('express-mailer');
const generator = require('generate-password');
const axios = require("axios");
var Web3 = require("web3");
const TronWeb = require('tronweb');
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);
// secret key generate 32 bytes of random data
const Securitykey = crypto.randomBytes(32);

const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

const userOtp = db.userotp;
const users = db.users;

const { SMTP_SECURE, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER, web3Provider } = require('../config/db.config.js');
console.log(SMTP_USER, '====SMTP_USER')
var app = express();

app.set('views', path.dirname('../') + '/views');
app.set('view engine', 'jade');

if (SMTP_USER == '') {
  mailer.extend(app, {
    from: SMTP_USER,
    host: SMTP_HOST,
    secureConnection: SMTP_SECURE,
    port: SMTP_PORT,
    transportMethod: 'SMTP'
  });
} else {
  mailer.extend(app, {
    from: SMTP_USER,
    host: SMTP_HOST,
    secureConnection: SMTP_SECURE,
    port: SMTP_PORT,
    transportMethod: 'SMTP',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    }
  });
}

// ===================================================================
// ==================Create random 6 digit OTP========================
// ===================================================================

const createRandomNumber = (length, numbers, lowercase, uppercase) => {
  return generator.generate({
    length: length,
    numbers: true,
    lowercase: lowercase,
    uppercase: uppercase
  })
}


exports.match = async (req, res) => {
  const { username, otp, time } = req.body;
  var otpCondition = username ? { [Op.and]: [{ username: username }, { otp: otp }] } : null;
  userOtp.findOne({ where: otpCondition }).then(async (result) => {
    console.log(result,'======result')
    if (result) {
      let addMin = 5;
      if (new Date(result.createdAt).getTime() + addMin * 60000 > new Date(time).getTime()) {
        return res.send({ status: 200, message: 'OTP Matched' })
      }
      else {
        console.log('OTP Expire')
        return res.send({ status: 404, message: 'OTP Expired' })
      }
    }
    else {
      console.log('OTP Not Matched')
      return res.send({ status: 404, message: 'OTP Not Matched' })
    }
  }).catch((error) => {
    console.error(error);
    res.send({ status: 500, data: error });
  })
}

// ===================================================================
// ================API Request To send Email OTP ===========================
// ===================================================================

exports.sendemail = async (req, res) => {
  const { email } = req.body;
  try {
    let otp = createRandomNumber(6, true, false, false);
    await sendEmailOtp(email, otp, res);
  } catch (error) {
    res.send({ status: 500, message: error })
  }
}

// ===================================================================
// =============Destroy previous Email OTP adn Stroe new Email OTP================
// ===================================================================
const sendEmailOtp = async (email, otp, res) => {
  try {
    var condition = email ? { username: { [Op.like]: email } } : null;
    await userOtp.findOne({ where: condition }).then(async (otpExist) => {
      if (otpExist) {
        console.log('=======step 1====')
        await userOtp.destroy({ where: { username: { [Op.like]: email } } }).then(async (deleteOtp) => {
          if (deleteOtp) {
            console.log('=======step 2====')
            await userOtp.create({ username: email, otp: otp }).then(async (result) => {
              console.log('=======step 3====')
              await sendOtpEmail(email, otp, res); //Send password email to register email 
            }).catch((error) => {
              return { status: 500, data: error }
            })
          }
        })
      }
      else {
        await userOtp.create({ username: email, otp: otp }).then(async (result) => {
          await sendOtpEmail(email, otp, res); //Send password email to register email 
        }).catch((error) => {
          return { status: 500, data: error }
        })
      }
    }).catch((error) => {
      return { status: 500, data: error }
    })
  } catch (error) {
    console.log(error)
    return { status: 500, data: error }
  }

}

// ===================================================================
// ==========================Final OTP Email Send=====================
// ===================================================================
const sendOtpEmail = async (email, otp, res) => {
  console.log('=======step 4====')
  try {
    app.mailer.send('otp', {
      to: email,
      subject: `【BLC EXCHANGE】Otp Verification`,
      data: { email: email, otp: otp }
    }, (err) => {
      console.log(err, ' errerrerr')

      if (err) {
        console.log(err)
        return { status: 500, message: err.message };
      } else {
        console.log('=======step 7====')
        res.status(200).send({ status:200, message: "Otp Sent" });
      }

    })

  } catch (error) {
    console.error(' ===== ', error)
    return { status: 500, message: error.message, };
  }
}

// ===================================================================
// ================API Request To send SMS OTP ===========================
// ===================================================================

exports.sendsms = async (req, res) => {
  const { number, dial_code } = req.body;
  try {
    let otp = createRandomNumber(6, true, false, false);
    await sendMobileOtp(number, otp, dial_code, res);

  } catch (error) {
    res.send({ status: 500, message: error })
  }
}

// ===================================================================
// =======Destroy previous Mobile OTP adn Stroe new Mobile OTP========
// ===================================================================

const sendMobileOtp = async (number, otp, dial_code,res) => {
  let bobo = { "username": number, "otp": otp };
  try {
    var condition = number ? { username: { [Op.like]: number } } : null;
    userOtp.findOne({ where: condition }).then((otpExist) => {
      if (otpExist) {
        userOtp.destroy({ where: { username: { [Op.like]: number } } }).then((deleteOtp) => {
          if (deleteOtp) {
            userOtp.create(bobo).then(async (result) => {
              if (result) {
                await sendSmsOtp(dial_code + '' + number, otp, res);//Send password email to register email 
              }
            }).catch((error) => {
              return res.send({ status: 500, data: error })
            })

          }
        }).catch((error) => {
          console.log(error);
          return res.send({ status: 500, data: error })
        })
      }
      else {
        userOtp.create(bobo).then(async (result) => {
          if (result) {
            await sendSmsOtp(dial_code + '' + number, otp, res);//Send password email to register email 
          }
        }).catch((error) => {
          return res.send({ status: 500, data: error })
        })
      }
    }).catch((error) => {
      return res.send({ status: 500, data: error })
    })
  } catch (error) {
    console.log(error)
    return res.send({ status: 500, data: error })
  }

}

// ===================================================================
// ==========================Final OTP SMS Send=====================
// ===================================================================
const sendSmsOtp = async (number, Otp, res) => {
  try {
    let message = 'Dear User, Your OTP is ' + Otp + ' Never share this OTP with anyone, this OTP expire in two minutes. More Info: https://stackoverflow.com/ From mlmsig'
    let url = 'http://sms.gniwebsolutions.com/submitsms.jsp?user=' + process.env.SMSUSER + '&key=' + process.env.SMSKEY + '&mobile=' + number + '&senderid=' + process.env.SMSSENDERID + '&message=' + message + '&accusage=' + process.env.ACCUSAGE;
    console.log(url);

    await axios.get(url)
      .then(function (response) {
        console.log(response.data);
        return res.status(200).send({status:200, message: 'OTP has been sent on Mobile Number'});
      })
      .catch(error => console.log('error', error));
  } catch (error) {
    console.error(' ===== ', error)
    return res.send({ status: 500, data: error })
  }
}


exports.storeWalletAddress = async (id) => {
  let account = generateBEP20Address(web3Provider);
  const bep20cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  const trc20cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  let encryptedBep20Key = bep20cipher.update(account.privateKey, "utf-8", "hex");
  encryptedBep20Key += bep20cipher.final("hex");

  let trc20Data = generateTRC20Address();
  let trc20 = await trc20Data.then((value) => {
    return value
  });
  let trc20Account = trc20.address.base58;
  let encryptedTrc20Key = trc20cipher.update(trc20.privateKey, "utf-8", "hex");
  encryptedTrc20Key += trc20cipher.final("hex");

  try {
    users.update({ bep20Address: account.address, bep20Hashkey: encryptedBep20Key, trc20Address: trc20Account, trc20Hashkey: encryptedTrc20Key }, { where: { id: id } }).then((result) => {
      if (result) {
        console.log('User Wallet Address updated');
        return 'User Wallet Address updated';
      }
    }).catch((error) => {
      res.send({ status: 500, error });
    })
  } catch (error) {

  }
}

/**
 * generate BEP20 wallet address
 */

const generateBEP20Address = (provider) => {
  var web3 = new Web3(provider); // your geth
  var account = web3.eth.accounts.create();
  return account;
}

/**
 * generate TRC20 wallet address
 */

const generateTRC20Address = () => {
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider('https://api.trongrid.io');
  const solidityNode = new HttpProvider('https://api.trongrid.io');
  const eventServer = new HttpProvider("https://api.trongrid.io");
  const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
  const account = tronWeb.createAccount();

  return account;
}