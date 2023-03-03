const { tokenDetail, getBlanceByuserID, addnewRequest , withdrawListbyTekenAndUserID } = require("../controllers/withdraw.controller");

module.exports = app => {
    var router = require("express").Router();
    // Create a new Tutorial
    router.get('/getToken/:id/:type', tokenDetail);
    router.post('/add/',addnewRequest); 

    router.get('/list/:userid', withdrawListbyTekenAndUserID);

    // how get list order by group in mysql?
    app.use("/api/withdraw",router)
   
};
  