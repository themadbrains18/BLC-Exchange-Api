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