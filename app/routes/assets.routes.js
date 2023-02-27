module.exports = app => {
  const assets = require("../controllers/assets.controller.js");

  var router = require("express").Router();

  router.get('/',assets.assetsList)

  app.use('/api-blc/assets', router);
};
