module.exports = app => {
    const post = require("../controllers/post.controller.js");
  
    var router = require("express").Router();
    // Create a new Tutorial
    router.post("/create", post.create);
    router.get('/balances/:id', post.getBlanceByuserID);
    router.get('/get/:userid', post.getPostByUser);
    router.delete('/delete/:postid',post.deletePost);
    router.get('/all',post.getAllAds);
  
    app.use('/api/post', router);
  };
  