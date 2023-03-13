const express = require("express");
const db = require("../../models");

const payments = db.paymentmethod;

exports.paymentAll = async (req, res) => {
    payments.findAll().then(async (result) => {
    if (result) {
        return res.send({ status: 200, data: result });
    }
  }).catch((error) => {
    console.error('===========', error);
  })
}
exports.paymentSave = async (req, res) => {
    try {
       await payments.findOne({where:{payment_method: req.body.payment_method}}).then(async (result) => {
            if (result) {
                return res.send({ status: 404, message: 'Payment method already register.' });
            }
            else{
              await payments.create(req.body).then(async (resp) => {
                if (resp) {
                    return res.send({ status: 200, data:resp});
                }
              })
            }
          }).catch((error) => {
            console.error('===========', error);
          })
    } catch (error) {
        return res.send({ status: 400, data: error }); 
    }
   
}