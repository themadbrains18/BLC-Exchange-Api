const db = require("../models");
const marketOrder = db.marketorder;
const assets = db.assets;
const tokens = db.tokens;
const Op = db.Sequelize.Op;
var moment = require('moment');

exports.create = (req, res) => {

  try {
    marketOrder.create(req.body).then((result) => {
      if (result) {
        if (req.body.order_type === 'sell') {
          assets.findOne({ where: { userID: req.body.userid, token_id: req.body.tokenid, walletType: 'main_wallet' } }).then((asset) => {
            asset.update({ balance: parseFloat(asset.balance) - parseFloat(req.body.token_amount) }).then((assetsupdate) => {
              if (assetsupdate) {
                console.log('update seller token assets');
              }
            }).catch((error) => {
              console.log('update seller assets error on order create', error)
              res.send({ status: 500, data: error })
            })
          }).catch((error) => {
            console.log('get seller assets error', error)
            res.send({ status: 500, data: error })
          })

        }
        if (req.body.order_type === 'buy') {
          assets.findOne({ where: { userID: req.body.userid, token_id: 1, walletType: 'main_wallet' } }).then((asset) => {
            asset.update({ balance: parseFloat(asset.balance) - parseFloat(req.body.volume_usdt) }).then((assetsupdate) => {
              if (assetsupdate) {
                console.log('update buyer token assets');
              }
            }).catch((error) => {
              console.log('update buyer assets error on order create', error)
              res.send({ status: 500, data: error })
            })
          }).catch((error) => {
            console.log('get seller assets error', error)
            res.send({ status: 500, data: error })
          })

        }
        res.send({ status: 200, message: 'Record Save Successfully !.' })
      }
    }).catch((error) => {
      console.error('=======', error);
      res.send({ status: 500, data: error });
    })
  } catch (error) {
    console.error('======= try catch error', error);
    res.send({ status: 500, data: error });
  }
}

exports.getAll = (req, res) => {

  try {
    tokens.findOne({ where: { symbol: req.params.token } }).then((result) => {
      if (result) {
        marketOrder.findAll({
          where: { tokenid: result.id }, order: [
            ['id', 'DESC']
          ]
        }).then(async (result) => {
          if (result) {
            let record = [];

            for (const order of result) {

              let date = moment(order.createdAt).format('L');
              let newdate = date.split('/');
              date = newdate[2] + '-' + newdate[0] + '-' + newdate[1];

              let updatedate = moment(order.updateAt).format('L');
              let newUpdateDate = updatedate.split('/');
              updatedate = newUpdateDate[2] + '-' + newUpdateDate[0] + '-' + newUpdateDate[1];

              let obj = {
                id: order.id,
                userid: order.userid,
                tokenid: order.tokenid,
                market_type: order.market_type,
                order_type: order.order_type,
                limit_usdt: order.limit_usdt,
                volume_usdt: order.volume_usdt,
                token_amount: order.token_amount,
                status: order.status,
                isCanceled: order.isCanceled,
                createdAt: date,
                updatedAt: updatedate,
                open: order.limit_usdt,
                high: order.limit_usdt,
                low: order.limit_usdt,
                close: order.limit_usdt
              };

              record.push(obj);
            }

            let chartData = await marketChartData(req.params.token);

            res.send({ status: 200, data: record, hloc: chartData })
          }
        }).catch((error) => {
          console.error(error)
          res.send({ status: 500, data: error })
        })
      }
    })

  } catch (error) {
    console.error(error)
    res.send({ status: 500, data: error })
  }
}

exports.cronMarketBuySell = () => {
  try {
    console.log('======================here ====================')
    marketOrder.findAll({ where: { status: false, isCanceled: false } }).then((marketResult) => {
      console.log(marketResult.length, '=============here length')
      if (marketResult) {
        tokens.findAll({}).then(async (token) => {
          if (token) {
            let symbol = '';
            for (const d of token) {
              if (d.tokenType === 'global') {
                if (symbol == '') {
                  symbol = d.symbol
                }
                else {
                  symbol += ',' + d.symbol;
                }
              }
            }

            let priceObj = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + symbol + '&tsyms=USDT&api_key=' + process.env.MIN_API_KEY).then(response =>
              response.json()
            ).then(result => { return result; })
              .catch(console.error);

            let marketRequest = marketResult.filter((item) => {
              return item.market_type === 'market'
            })

            if (marketRequest.length > 0) {
              buySellOnMarketPrice(marketRequest, priceObj, token);
            }

            let limitRequest = marketResult.filter((item) => {
              return item.market_type === 'limit'
            })

            if (limitRequest.length > 0) {

              buySellOnLimit(limitRequest, priceObj, token);
            }

            // res.send({status : 200, data : limitRequest});

          }
        }).catch((error) => {
          console.error('===========', error);
        })
      }
    }).catch((error) => {

    })
  } catch (error) {

  }
}

const buySellOnLimit = (orders, marketPriceObj, token) => {

  try {
    /** Get/Filter buyer bids */
    let buyBids = orders.filter((item) => {
      return item.order_type === 'buy'
    })

    /** Get/Filter seller bids */
    let sellBids = orders.filter((item) => {
      return item.order_type === 'sell'
    })

    //======map function on buyer user array===============
    let previous_seller = [];
    for (const buyer of buyBids) {

      let tt = token.filter((item) => {
        return item.id === buyer.tokenid
      })

      let marketPrice = 0;

      if (tt[0].tokenType === 'custom') {
        marketPrice = tt[0].price;
      }

      else {
        marketPrice = marketPriceObj[tt[0].symbol]['USDT'];
      }

      console.log(marketPrice, '===marketPrice============')

      if (previous_seller.length > 0) {
        sellBids = sellBids.filter((item) => {
          return item.id != previous_seller[0].id;
        })
      }
      //=====map function on seller user array=========
      for (const seller of sellBids) {
        console.log('===how many time run for loop============')
        if (buyer.tokenid === seller.tokenid && seller.token_amount >= buyer.token_amount) {

          if (parseFloat(buyer.limit_usdt) >= parseFloat(marketPrice)) {

            if (parseFloat(buyer.limit_usdt) >= parseFloat(seller.limit_usdt) && parseFloat(seller.limit_usdt) >= parseFloat(marketPrice)) {

              previous_seller.push(seller);
              let paid_usdt = parseFloat(buyer.token_amount) * parseFloat(marketPrice)
              console.log(paid_usdt, 'paid usdt amount');
              let paid_to_admin_usdt = parseFloat(buyer.volume_usdt) - parseFloat(paid_usdt);
              console.log(paid_to_admin_usdt, 'paid to admin usdt amount')
              processExecution(buyer, seller, marketPrice, paid_usdt, paid_to_admin_usdt)
            }
            // else if(parseFloat(seller.limit_usdt) === parseFloat(buyer.limit_usdt) && parseFloat(seller.limit_usdt)>= parseFloat(marketPrice)){
            //   console.log('buyer limit equal to seller limit and seller limit greater than/ equal to market price');
            // }
          }
          else if (buyer.limit_usdt > seller.limit_usdt && marketPrice >= buyer.limit_usdt) {
            console.log('here when seller limit less than buyer and price more than buyer')
            previous_seller.push(seller);
            let paid_usdt = parseFloat(buyer.token_amount) * parseFloat(seller.limit_usdt)
            console.log(paid_usdt, 'paid usdt amount');
            let paid_to_admin_usdt = parseFloat(buyer.volume_usdt) - parseFloat(paid_usdt);
            console.log(paid_to_admin_usdt, 'paid to admin usdt amount')
            processExecution(buyer, seller, marketPrice, paid_usdt, paid_to_admin_usdt)
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }

}

const processExecution = async (buyer, seller, marketPrice, paid_usdt, paid_to_admin_usdt) => {

  // ==============================================================================
  //================= Seller token assets updates(eg: USD) ========================
  // ==============================================================================

  console.log('===here case 1');
  await assets.findOne({ where: { userID: seller.userid, walletType: 'main_wallet', token_id: 1 } }).then(async (asset) => {

    if (asset) {
      console.log('===here case 2');
      console.log('limit case seller usdt amount', parseFloat(asset.balance) + (parseFloat(paid_usdt)))
      await asset.update({ balance: parseFloat(asset.balance) + (parseFloat(paid_usdt)) }).then((responseUsdt) => {
        if (responseUsdt) {
          console.log('update seller usdt assets ')
        }
      })
    }
    else {
      await assets.create({
        "userID": seller.userid,
        "accountType": 'Main Account',
        "token_id": 1,
        "balance": paid_usdt,
        "walletType": 'main_wallet',
      }).then((record) => {
        if (record) {
          console.log('here add new assets in user account');
        }
      }).catch((err) => {
        console.log(err)
      })
    }

  }).catch((error) => {
    console.log(error, '==========')
  })
  //============================Seller assets updates End==========================


  // ==============================================================================
  // ==========================Buyer assets updates================================
  // ==============================================================================

  console.log('===here case 7')
  await assets.findOne({ where: { userID: buyer.userid, walletType: 'main_wallet', token_id: buyer.tokenid } }).then(async (buyerassets) => {

    if (buyerassets) {
      console.log('===here case 9');
      await buyerassets.update({ balance: parseFloat(buyerassets.balance) + parseFloat(buyer.token_amount) }).then((responseUsdt) => {
        if (responseUsdt) {
          console.log('update buyer token assets ')
        }
      }).catch((error) => {
        console.log('update buyer token assets error', error);
      })
    }
    else {
      assets.create({
        "userID": buyer.userid,
        "accountType": 'Main Account',
        "token_id": buyer.tokenid,
        "balance": buyer.token_amount,
        "walletType": 'main_wallet',
      }).then((record) => {
        if (record) {
          console.log('here add new assets in user account');
        }
      }).catch((err) => {
        console.log('create buyer token assets error', err);
      })
    }

  }).catch((error) => {
    console.log('buyer case error', error);
  })
  //==========================Buyer assets updates End=============================

  // ==============================================================================
  // ================= Admin token assets updates(eg: USD) ========================
  // ==============================================================================

  // await adminProfitModel.create({
  //   "buy_orderid": buyer._id.toString(),
  //   "sell_orderid": seller._id.toString(),
  //   "amount": paid_to_admin_usdt,
  //   "token": buyer.token,
  // }).then((record) => {
  //   if (record) {
  //     console.log('here add new assets in admin account');
  //   }
  // }).catch((err) => {
  //   console.log(err)
  // })

  //============================Admin assets updates End==========================

  //=======================Update market buy sell record after matched=============
  updateBuyerSellerOrderStatus(buyer, seller);

  //=======================Save Entry In Market History============================
  // createMarketOrderHistory(buyer, seller, marketPrice);

}

const updateBuyerSellerOrderStatus = (buyer, seller) => {
  if (parseFloat(buyer.token_amount) === parseFloat(seller.token_amount)) {
    // console.log('===here case 5');
    marketOrder.findOne({ where: { id: seller.id } }).then((updateMarketRecord) => {
      if (updateMarketRecord) {
        updateMarketRecord.update({ status: true }).then((response) => {
          if (response) {

          }
        })
      }
    }).catch((error) => {
      console.log('===seller market record update', error);
    })
  }
  // seller_token_value greater than buyer_token_value  market record update token value
  else {

    marketOrder.findOne({ where: { id: seller.id } }).then((updateMarketRecord) => {
      if (updateMarketRecord) {
        updateMarketRecord.update({ token_amount: parseFloat(seller.token_amount) - parseFloat(buyer.token_amount) }).then((response) => {
          if (response) {
            console.log('=========update seller tokne value')
          }
        })
      }
    }).catch((error) => {
      console.log('===seller market record update', error);
    })

  }

  // console.log('===here case 7')
  marketOrder.findOne({ where: { id: buyer.id } }).then((updateMarketRecord) => {
    if (updateMarketRecord) {
      updateMarketRecord.update({ status: true }).then((response) => {
        if (response) {

        }
      })
    }
  }).catch((error) => {
    console.log('===seller market record update', error);
  })
}

const buySellOnMarketPrice = (orders, marketPriceObj, token) => {

  /** Get/Filter buyer bids */
  let buyBids = orders.filter((item) => {
    return item.order_type === 'buy'
  })

  /** Get/Filter seller bids */
  let sellBids = orders.filter((item) => {
    return item.order_type === 'sell'
  })

  let previousSeller = [];

  buyBids.map(async (buyer) => {

    let tt = token.filter((item) => {
      return item.id === buyer.tokenid
    })

    let marketPrice = 0;

    if (tt[0].tokenType === 'custom') {
      marketPrice = tt[0].price;
    }

    else {
      marketPrice = marketPriceObj[tt[0].symbol]['USDT'];
    }

    console.log(marketPrice, '===marketPrice============')

    if (previousSeller.length > 0) {
      sellBids = sellBids.filter(function (el) { return el.id != previousSeller.id });
    }

    previousSeller = [];

    sellBids.map(async (seller) => {
      if (marketPrice !== undefined) {
        if (buyer.tokenid === seller.tokenid && seller.token_amount >= buyer.amount_token) {

          previousSeller.push(seller);

          //==============================================================================
          //===================Seller assets updates======================================
          //==============================================================================

          assets.findOne({ userID: seller.userid, walletType: 'main_wallet', token_id: 1 }).then((asset) => {

            if (asset) { //check if seller USDT assets not exist 
              asset.update({ balance: parseFloat(asset.balance) + (parseFloat(buyer.token_amount) * parseFloat(marketPrice)) }).then((responseUsdt) => {
                if (responseUsdt) {
                  // console.log('update usdt assets ')
                }
              })

            }
            else {
              // update seller USDT assets when exist  
              console.log(parseFloat(buyer.token_amount) * parseFloat(marketPrice), 'Seller usdt amount');
              assets.create({
                "userID": seller.userid,
                "accountType": 'Main Account',
                "token_id": 1,
                "balance": parseFloat(buyer.token_amount) * parseFloat(marketPrice),
                "walletType": 'main_wallet',
              }).then((record) => {
                if (record) {
                  console.log('here add new assets in user account');
                }
              }).catch((err) => {
                console.log(err)
              })
            }
          }).catch((error) => {
            console.log(error, '==========')
          })

          //=====================Seller assets updates End=================================

          //===============================================================================
          //=====================Buyer assets updates======================================
          //===============================================================================

          // console.log('===here case 8')
          assets.findOne({ where: { userID: buyer.userid, walletType: 'main_wallet', token_id: buyer.tokenid } }).then((buyerassets) => {

            if (buyerassets) { //check if seller token assets not exist 
              buyerassets.update({ balance: parseFloat(buyerassets.balance) + parseFloat(buyer.token_amount) }).then((responseUsdt) => {
                if (responseUsdt) {
                  // console.log('update token assets ')
                }
              })

            }
            else {
              // update seller USDT assets when exist  
              assets.create({
                "userID": buyer.userid,
                "accountType": 'Main Account',
                "token_id": buyer.tokenid,
                "balance": buyer.token_amount,
                "walletType": 'main_wallet',
              }).then((record) => {
                if (record) {
                  console.log('here add new assets in user account');
                }
              }).catch((err) => {
                console.log(err)
              })
            }

          }).catch((error) => {
            console.log('buyer case error', error);
          })
          //=======================Buyer assets updates End================================

          //=======================Update market buy sell record after matched=============
          updateBuyerSellerOrderStatus(buyer, seller);

        }
      }
    })
  })
}

exports.socketMarket = async (socket, body) => {
  try {
    let data = await db.sequelize.query(`select market.*,token.symbol from blc.marketorders as market inner join blc.tokens as token on market.tokenid = token.id where token.symbol='${body.symbol}' order by id desc`);
    let record = [];
    for (const order of data[0]) {
      let date = moment(order.createdAt).format('L');
      let newdate = date.split('/');
      date = newdate[2] + '-' + newdate[0] + '-' + newdate[1];

      let updatedate = moment(order.updateAt).format('L');
      let newUpdateDate = updatedate.split('/');
      updatedate = newUpdateDate[2] + '-' + newUpdateDate[0] + '-' + newUpdateDate[1];

      let obj = {
        id: order.id,
        userid: order.userid,
        tokenid: order.tokenid,
        market_type: order.market_type,
        order_type: order.order_type,
        limit_usdt: order.limit_usdt,
        volume_usdt: order.volume_usdt,
        token_amount: order.token_amount,
        status: order.status,
        isCanceled: order.isCanceled,
        createdAt: date,
        updatedAt: updatedate,
        open: order.limit_usdt,
        high: order.limit_usdt,
        low: order.limit_usdt,
        close: order.limit_usdt,
        symbol: order.symbol
      };

      record.push(obj);
    }

    let chartData = await marketChartData(body.symbol);

    socket.broadcast.emit("market", { record, hloc: chartData });
  } catch (error) {

  }
}

const marketChartData = async (symbol) => {
  try {

    let data = await db.sequelize.query(`SELECT DATE(createdAt) AS time, max(limit_usdt) AS high, min(limit_usdt) AS low,
    CAST(SUBSTRING_INDEX(MIN(CONCAT(createdAt, '_', limit_usdt)), '_', -1) as double)  as open,
	  CAST( SUBSTRING_INDEX(MAX(CONCAT(createdAt, '_', limit_usdt)), '_', -1)as double) AS close
    FROM blc.marketorders AS marketorder where tokenid=(select id from blc.tokens where symbol='${symbol}' limit 1) GROUP BY time`);

    // let dd = await db.marketorder.unscoped().findAll({
    //   // attributes: [[db.sequelize.fn('max', db.sequelize.col('limit_usdt')), 'max'], 'createdAt'],
    //   attributes: [
    //     [db.sequelize.literal(`DATE(createdAt)`), 'date'],
    //     [db.sequelize.fn('max', db.sequelize.col('limit_usdt')), 'max'],
    //     [db.sequelize.fn('min', db.sequelize.col('limit_usdt')), 'min'],
    // ],
    //   group: ['date']
    // })

    //  console.log(dd)/

    return data[0]

    // res.status(200).send(data[0])

  } catch (error) {
    console.log(error)
  }
}
exports.getAllOrders = (req, res) => {
  console.log("=========req")
  try {
    tokens.findOne({ where: { symbol: req.params.token } }).then((result) => {
      if (result) {
        marketOrder.findAll({ where: { tokenid: result.id, userid: req.params.userid } }, {
          order: [
            ['id', 'DESC'],
          ],
        }).then((result) => {
          if (result) {
            res.send({ status: 200, data: result })
          }
        }).catch((error) => {
          console.error(error)
          res.send({ status: 500, data: error })
        })
      }
    })

  } catch (error) {
    console.error(error)
    res.send({ status: 500, data: error })
  }
}