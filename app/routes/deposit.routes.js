const {  saveTransaction,saveTRXTransaction,saveTRC20Transaction } = require("../controllers/deposit.controller");

module.exports = app => {
    var router = require("express").Router();
    // Create a new Tutorial
    router.post("/save", saveTransaction)
    router.post('/saveTrx',saveTRXTransaction)
    router.post('/saveTrc20',saveTRC20Transaction)

    app.use("/api/deposit",router)
   
};
  