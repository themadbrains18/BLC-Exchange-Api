module.exports = app => {
    const post = require("../controllers/post.controller.js");
  
    var router = require("express").Router();
    // Create a new Tutorial
    router.post("/create", post.create);
    router.get('/balances/:id', post.getBlanceByuserID);
  
    app.use('/api/post', router);
  };
  