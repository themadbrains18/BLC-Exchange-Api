const express = require("express");
const db = require("../models");

const tokens = db.tokens;

exports.tokenAll = async(req,res)=>{
  tokens.findAll().then(async(result)=>{
    if(result){
      res.status(200).send(result);
    }
  }).catch((error)=>{
    console.error('===========', error);
  })
}