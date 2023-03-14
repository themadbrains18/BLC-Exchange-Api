module.exports = app => {
    const kyc = require("../controllers/kyc.controller.js");
  
    var router = require("express").Router();
    // Create a new Tutorial
    router.post("/create", kyc.create);

    router.get('/:id',kyc.kycById);
    
    app.use('/api/kyc', router);
  };
  