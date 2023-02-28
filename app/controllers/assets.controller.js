const db = require("../models");
const assets = db.assets;
const { Op } = require("sequelize");

exports.assetsList=async(req,res)=>{
  assets.findAll().then(async(result)=>{
    if(result){
      res.status(200).send(result);
    }
  }).catch((error)=>{
    console.error('===========', error);
  })
}
exports.assetsById=async(req,res)=>{
  assets.findAll({ where: { userID: parseInt(req.params.id) } }).then(async(result)=>{
    if(result){
      res.status(200).send(result);
    }
  }).catch((error)=>{
    console.error('===error2', error);
  })
}