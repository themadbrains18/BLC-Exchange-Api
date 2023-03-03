module.exports = app => {
  const networks = require("../controllers/network.controller.js");

  var router = require("express").Router();

  router.get('/',networks.networkAll);

  app.use('/api/network', router);
};
