module.exports = app => {
    const kyc = require("../controller/kyc.controller.js");
  
    var router = require("express").Router();
    // Create a new Tutorial
    router.get('/',kyc.kycAll);
    router.put('/kycupdate/:id',kyc.kycUpdate);

  
    app.use('/api/admin/kyc', router);
  };
  