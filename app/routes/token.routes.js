module.exports = app => {
  const tokens = require("../controllers/token.controller.js");

  var router = require("express").Router();

  router.get('/',tokens.tokenAll);

  app.use('/api-blc/token', router);
};
