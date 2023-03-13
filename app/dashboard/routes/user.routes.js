module.exports = app => {
    const users = require("../controller/user.controller");
  
    var router = require("express").Router();
    // Create a new Tutorial

    router.post("/admin-login", users.login);
    router.get("/", users.usersList);
  
    app.use('/api/admin/user', router);
  };
  