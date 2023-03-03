module.exports = app => {
    const kyc = require("../controllers/kyc.controller.js");
  
    var router = require("express").Router();
    // Create a new Tutorial
    router.post("/create", kyc.create);

  
    app.use('/api/kyc', router);
  };
  