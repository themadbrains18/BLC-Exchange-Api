module.exports = app => {
  const payment = require("../controllers/payment.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/save", payment.create);
  router.get("/list", payment.list);
  router.get("/method/:id", payment.single);

  router.post("/add-method", payment.addMethod); // create by users
  router.get("/get-method/:id", payment.getMethod); // get methods by user id 
  router.get("/delete-method/:id", payment.deleteRequest); // delete methods by user id 


  app.use('/api/payment', router);
};
