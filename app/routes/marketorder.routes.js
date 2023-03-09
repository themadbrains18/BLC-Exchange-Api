module.exports = app => {
  const market = require("../controllers/marketorder.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/create", market.create);
  router.get("/:token",market.getAll);
  router.get('/trasfer/cron',market.cronMarketBuySell);

  app.use('/api/market', router);
};
