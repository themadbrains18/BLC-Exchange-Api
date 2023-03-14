module.exports = app => {
    const chat = require("../controllers/chat.controller.js");
  
    var router = require("express").Router();
    router.post("/create", chat.create);
    router.get("/all/:orderid", chat.getChat);

    app.use('/api/chat', router);
  };
  