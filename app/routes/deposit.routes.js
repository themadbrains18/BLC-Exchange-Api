const {  saveTransaction,saveTRXTransaction,saveTRC20Transaction,getdepositDetails } = require("../controllers/deposit.controller");

module.exports = app => {
    var router = require("express").Router();
    // Create a new Tutorial
    router.post("/save", saveTransaction)
    router.post('/saveTrx',saveTRXTransaction)
    router.post('/saveTrc20',saveTRC20Transaction)
    router.get('/list/:id',getdepositDetails);

    app.use("/api/deposit",router)
   
};
  