module.exports = app => {
  const order = require("../controllers/order.controller.js");

  var router = require("express").Router();
  router.post("/create", order.create);
  router.put('/cancel', order.cancelOrder);
  router.put('/update', order.updateOrder);
  router.get('/all/:userid', order.getOrderList);
  router.get('/order/:orderid', order.getOrderById);
  router.post('/release', order.releaseOrder);

  app.use('/api/order', router);
};
