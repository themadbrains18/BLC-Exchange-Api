const express = require("express");
const db = require("../../models");

const deposits = db.deposit;

exports.depositAll = async (req, res) => {
    deposits.findAll().then(async (result) => {
    if (result) {
        return res.send({ status: 200, data: result });
    }
  }).catch((error) => {
    console.error('===========', error);
  })
}