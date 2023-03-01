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
  router.put('/password', users.updatePassword);
  router.post('/confirPassword', users.confirmPassword);
  router.post('/confirmFunCode',users.confirmFuncode);
  router.delete('/delete/:id', users.removeUser);
  router.get('/address/:id/:type', users.depositAddress);

  app.use('/api-blc/users', router);
};
