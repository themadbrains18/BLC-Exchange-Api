module.exports = app => {
  const assets = require("../controllers/assets.controller.js");

  var router = require("express").Router();

  router.get('/',assets.assetsList);
  router.get('/:id',assets.assetsById);
  router.post('/wallettransfer', assets.walletTowalletTranserfer);
  router.get('/overview/:userid/:currency', assets.assetsOverview);
  router.get('/history/:userid', assets.transferHistory);

  app.use('/api/assets', router);
};
