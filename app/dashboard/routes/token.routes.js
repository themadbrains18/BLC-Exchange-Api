

module.exports = app => {
  const tokens = require("../controller/token.controller.js");
  var router = require("express").Router();
  router.get('/',tokens.tokenAll);
  router.get('/getToken/:id',tokens.getTokenById);
  app.use('/api/admin/token', router);
};
