const express = require("express");
const db = require("../models");

const networks = db.networks;

exports.networkAll = async(req,res)=>{
  networks.findAll().then(async(result)=>{
    if(result){
      res.status(200).send(result);
    }
  }).catch((error)=>{
    console.error('===========', error);
  })
}