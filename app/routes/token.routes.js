const { getBlanceByuserID } = require("../controllers/withdraw.controller.js");

module.exports = app => {
  const tokens = require("../controllers/token.controller.js");

  var router = require("express").Router();

  router.get('/',tokens.tokenAll);
  router.get('/balances/:id', getBlanceByuserID);

  router.get('/marketcoin',tokens.getMarketCoin)

  app.use('/api/token', router);
};
