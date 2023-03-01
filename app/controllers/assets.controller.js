const db = require("../models");
const assets = db.assets;
const tokenTable = db.tokens;
const { Op } = require("sequelize");

exports.assetsList = async (req, res) => {
  assets.findAll().then(async (result) => {
    if (result) {
      res.status(200).send(result);
    }
  }).catch((error) => {
    console.error('===========', error);
  })
}
exports.assetsById=async(req,res)=>{
  assets.findAll({ where: { userID: parseInt(req.params.id) } }).then(async(result)=>{
    if(result){
      res.status(200).send(result);
    }
  }).catch((error)=>{
    console.error('===error2', error);
  })
}


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
              senderAssets[0].update({ balance: senderUpdateAmount }).then((response) => {
                if (response) {
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
                    assets.create(body).then((create)=>{
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