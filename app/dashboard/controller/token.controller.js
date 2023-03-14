const express = require("express");
const db = require("../../models");

const tokens = db.tokens;
const networks = db.networks

exports.tokenAll = async (req, res) => {
  try {
    let networksList = await networks.findAll().then((result) => {
      if (result) {
        return result
      }
    })


    tokens.findAll().then(async (result) => {
      if (result) {
        let newObj = []
        for (const e of result) {
         
          let tokenNetwork = JSON.parse(e.networks)

          let addnewthred = []
          let ff = networksList.filter((item) => {
            tokenNetwork.map((i, e) => {
              if (i.id == item.id) {
                addnewthred.push(item)
              }
            })
          })


          // console.log("=============ffffffff", ff);
           e.networks = addnewthred;
          newObj.push(e)
        }
        // res.send({ status: 200, data: a })
        return res.send({ status: 200, data: newObj });
      }
    }).catch((error) => {
      console.error('===========', error);
    })
  } catch (error) {

  }

}

exports.getTokenById = async (req, res) => {

  try {
    // console.log("========req.prams.id",typeof(req.params.id))
    await tokens.findOne({ where: { id: parseInt(req.params.id) } }).then(async (result) => {

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