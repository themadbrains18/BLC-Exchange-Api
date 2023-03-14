module.exports = app => {
    const payment = require("../controller/payment.controller.js");
  
    var router = require("express").Router();
    // Create a new Tutorial
    router.get('/pm_methods',payment.paymentAll);
    router.post('/save',payment.paymentSave);


  
    app.use('/api/admin/payment', router);
  };
  