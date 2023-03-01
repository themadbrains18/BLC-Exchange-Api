module.exports = app => {
  const assets = require("../controllers/assets.controller.js");

  var router = require("express").Router();

  router.get('/',assets.assetsList)
  router.get('/:id',assets.assetsById)
  router.post('/wallettransfer', assets.walletTowalletTranserfer)

  app.use('/api-blc/assets', router);
};
