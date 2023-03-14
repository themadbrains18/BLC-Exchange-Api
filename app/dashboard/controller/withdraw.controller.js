const express = require("express");
const db = require("../../models");

const withdraws = db.withdraws;

exports.withdrawAll = async (req, res) => {
    withdraws.findAll().then(async (result) => {
    if (result) {
        return res.send({ status: 200, data: result });
    }
  }).catch((error) => {
    console.error('===========', error);
  })
}