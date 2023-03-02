const { saveDepositData } = require("../controllers/deposit.controller");

module.exports = app => {
    var router = require("express").Router();
    // Create a new Tutorial
    router.get("/save/:address", saveDepositData);
    router.post('/trxtransaction',)

    app.use("/api-blc/deposit",router)
   
};
  