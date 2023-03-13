

module.exports = app => {
    const withdraw = require("../controller/withdraw.controller.js");
    var router = require("express").Router();
    router.get('/',withdraw.withdrawAll);
    app.use('/api/admin/withdraw', router);
  };
  