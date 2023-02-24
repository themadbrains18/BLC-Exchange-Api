module.exports = app => {
  const users = require("../controllers/user.controller.js");

  var router = require("express").Router();
  // Create a new Tutorial
  router.post("/create", users.register);
  router.post("/login", users.login);
  router.post('/',users.checkUser);
  router.put('/update',users.updateUser);
  router.post('/googleAuth', users.verifyGoogleAuth);
  router.post('/userinfo',users.userAuthenticate);

  app.use('/api-blc/users', router);
};
