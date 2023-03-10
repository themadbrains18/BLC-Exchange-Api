const express = require("express");
const { users } = require("../../models");
const db = require("../../models");

const kyc = db.kyc;
const user = db.users;

exports.kycAll = async (req, res) => {
    let alluser = await user.findAll().then((users) => {
        if (users) {
            return users;
        }
    })

    kyc.findAll().then(async (result) => {
        if (result) {
            let record = [];
            for (const k of result) {
                let user = alluser.filter((item) => {
                    return item.id === parseInt(k.user_id)
                })
                let obj = {
                    name: k.name,
                    lname: k.lname,
                    doctype: k.doctype,
                    docnumber: k.docnumber,
                    dob: k.dob,
                    idfront: k.idfront,
                    idback: k.idback,
                    statement: k.statement,
                    email: user[0]?.email,
                    number:user[0]?.number,
                    status: user[0]?.kycstatus,
                    isVerified: k.isVerified,
                    user_id: user[0]?.id
                }
                record.push(obj);
            }
            return res.send({ status: 200, data: record });

        }
    }).catch((error) => {
        console.error('===========', error);
    })
}

exports.kycUpdate = async (req, res) => {
    console.log("=========req,", req.body.status)
    try {
        let status =  req.body.status
        await user.findOne({ where: { id: parseInt(req.params.id) } }).then(async (users) => {
            if (users) {
                    await users.update({ kycstatus: req.body.status }).then(async (updateRecord) => {
                        await db.kyc.update({ isVerified: (status=='success'?true:false) }, { where: { user_id: parseInt(req.params.id) } })
    
                        let newReocrd = await db.kyc.findOne({ where: { user_id: parseInt(req.params.id) } })
    
                        return res.send({ status: 200, data: newReocrd });
                    })       
            }
        }).catch((e) => {
            console.log("==========e", e)

        })
    } catch (error) {

    }
}