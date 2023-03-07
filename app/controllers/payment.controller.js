const db = require("../models");
const Payment_Method = db.paymentmethod;
const Op = db.Sequelize.Op;


exports.create=(req,res)=>{
  try {
    Payment_Method.create(req.body).then((result)=>{
      if(result){
        res.send({status : 200, message : 'Record Save Successfully !.'})
      }
    }).catch((error)=>{
      console.error('=======', error);
      res.send({status : 500, data : error});
    })
  } catch (error) {
    console.error('======= try catch error', error);
      res.send({status : 500, data : error});
  }
}

