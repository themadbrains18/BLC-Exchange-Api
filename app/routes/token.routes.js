const { getBlanceByuserID } = require("../controllers/withdraw.controller.js");

module.exports = app => {
  const tokens = require("../controllers/token.controller.js");

  var router = require("express").Router();

  router.get('/',tokens.tokenAll);
  router.get('/balances/:id', getBlanceByuserID);

  app.use('/api-blc/token', router);
};
