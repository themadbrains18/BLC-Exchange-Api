

module.exports = app => {
    const deposit = require("../controller/deposit.controller.js");
    var router = require("express").Router();
    router.get('/',deposit.depositAll);
    app.use('/api/admin/deposit', router);
  };
  