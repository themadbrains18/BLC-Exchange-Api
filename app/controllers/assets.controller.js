const db = require("../models");
const users = db.assets;
const { Op } = require("sequelize");

exports.assetsList=async(req,res)=>{
  return res.status(200).send({dataa:"Here Assets List"});
}