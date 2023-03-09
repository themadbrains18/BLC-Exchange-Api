const db = require("../models");
const assets = db.assets;
const tokenTable = db.tokens;
const transferAssets = db.transferhistory;
const { Op } = require("sequelize");

const {getPriceOfTokenBYCurrency} = require('./common.controller')

exports.assetsList = async (req, res) => {
  assets.findAll().then(async (result) => {
    if (result) {
      res.status(200).send(result);
    }
  }).catch((error) => {
    console.error('===========', error);
  })
}

/**
 * Get user assets by user id
 * @param {*} req 
 * @param {*} res 
 */
exports.assetsById=async(req,res)=>{

  const results = await db.sequelize.query('select * from assets as asset inner join tokens as token where asset.token_id = token.id and asset.userID='+req.params.id);
  res.status(200).send(results[0]);
}

/**
 * Transfer user own assets from wallet to wallet
 * @param {*} req 
 * @param {*} res 
 */
exports.walletTowalletTranserfer = (req, res) => {
  console.log(req.body);
  const { userid, from_wallet, to_wallet, value, token_id } = req.body;
  try {
    tokenTable.findOne({ where: { id: token_id } }).then((token) => {

      if (token) {
        assets.findAll({ where: { userID: userid } }).then((asset) => {
          if (asset) {
            let senderAssets = asset.filter((item) => {
              return item.walletType === from_wallet && parseInt(item.token_id) === token_id;
            })

            let receiverAssets = asset.filter((item) => {
              return item.walletType === to_wallet && parseInt(item.token_id) === token_id;
            })

            let senderUpdateAmount = parseFloat(senderAssets[0].balance) - parseFloat(value);

            if (senderAssets.length > 0) {
              senderAssets[0].update({ balance: senderUpdateAmount }).then(async(response) => {
                if (response) {

                  let transferbody = {
                    "userID": userid,
                    "from": from_wallet === 'trading_wallet' ? "Trading Account" : from_wallet === 'main_wallet' ? 'Main Account' : 'Funding Account',
                    "to": to_wallet === 'trading_wallet' ? "Trading Account" : to_wallet === 'main_wallet' ? 'Main Account' : 'Funding Account',
                    "token_id": token_id,
                    "balance": value
                  }

                  await transferAssets.create(transferbody).then((history)=>{
                    if(history){
                      console.log('create history')
                    }
                  }).catch((error)=>{
                    console.log('====transfer', error);
                  })

                  if (receiverAssets.length > 0) {
                    let amount = parseFloat(receiverAssets[0].balance) + parseFloat(value);
                    receiverAssets[0].update({ balance: amount }).then((update) => {
                      if (update) {
                        res.send({status : 200, message : 'Coin Trasfer successfully !.'});
                      }
                    }).catch((error) => {
                      console.error('===update receiver assets', error)
                      res.send({status : 500, data : error});
                    })
                  }
                  else {
                    let body = {
                      "userID": userid,
                      "accountType": to_wallet === 'trading_wallet' ? "Trading Account" : to_wallet === 'main_wallet' ? 'Main Account' : 'Funding Account',
                      "walletType": to_wallet,
                      "token_id": token_id,
                      "balance": value
                    }
                    assets.create(body).then(async(create)=>{
                      if(create){
                        res.send({status : 200, message : 'Coin Trasfer successfully !.'});
                      }
                    }).catch((error)=>{
                      console.error('===create asset',error);
                      res.send({status : 500, data : error});
                    })
                  }
                }
              }).catch((error) => {
                console.error('===update sender assets', error);
                res.send({status : 500, data : error});
              })
            }
          }
        }).catch((error)=>{
          console.error('=========find assets',error);
          res.send({status : 500, data : error});
        })
      }
    }).catch((error) => {
      console.error('====', error);
      res.send({ status: 500, data: error })
    })
  } catch (error) {

  }

}

/**
 * Get user assets overview by currency
 * @param {*} req 
 * @param {*} res 
 */
exports.assetsOverview = async(req,res)=>{

  let mainWalletAssets = 0;
  let tradingWalletAssets = 0;
  let fundingWalletAssets = 0;
  let convertPriceObj;
  try {

    let response = await getPriceOfTokenBYCurrency(req.params.userid, req.params.currency);
    
    convertPriceObj = response;
    const results = await db.sequelize.query('select * from assets as asset inner join tokens as token where asset.token_id = token.id and asset.userID='+req.params.userid);

    for (const item of results[0]) {

      let convertPrice = parseFloat(response[item.symbol][req.params.currency]) * parseFloat(item.balance)
      if (item.walletType === 'main_wallet') {
        mainWalletAssets = mainWalletAssets + convertPrice
      }
      else if (item.walletType === 'trading_wallet') {
        tradingWalletAssets = tradingWalletAssets + convertPrice
      }
      else {
        fundingWalletAssets = fundingWalletAssets + convertPrice
      }
  
    }

    let data = { overall: (mainWalletAssets + tradingWalletAssets + fundingWalletAssets), main: mainWalletAssets, trade: tradingWalletAssets, funding: fundingWalletAssets,convertPrice: convertPriceObj }
    return res.send({ status: 200, data });
  } catch (error) {
    
  }
}

exports.transferHistory=async(req,res)=>{
  try {
    const results = await db.sequelize.query('select * from transferassethistories as transfer inner join tokens as token where transfer.token_id = token.id and transfer.userID='+req.params.userid);

    res.send({status : 200, data : results[0]})
  } catch (error) {
    
  }
}