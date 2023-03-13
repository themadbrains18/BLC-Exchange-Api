const express = require("express");
const db = require("../../models");

const tokens = db.tokens;

exports.tokenAll = async (req, res) => {
  tokens.findAll().then(async (result) => {
    if (result) {
        return res.send({ status: 200, data: result });
    }
  }).catch((error) => {
    console.error('===========', error);
  })
}

exports.getTokenById = async (req, res) => {
 
try {
  // console.log("========req.prams.id",typeof(req.params.id))
 await tokens.findOne({where:{ id: parseInt(req.params.id)}}).then(async (result) => {
    
    if (result) {
        return res.send({ status: 200, data: result });
    }
  }).catch((error) => {
    console.error('===========', error);
  })
} catch (error) {
  return res.send({ status: 404, data: error });
}
 
}