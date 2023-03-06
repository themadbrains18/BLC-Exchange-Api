module.exports = app => {
  const patment = require("../controllers/payment.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/save", patment.create);

  app.use('/api/payment', router);
};
