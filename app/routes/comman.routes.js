module.exports = app => {
  const common = require("../controllers/common.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/email", common.sendemail);
  router.post("/phone", common.sendsms);
  router.post("/match", common.match);

  app.use('/api-blc/otp', router);
};
