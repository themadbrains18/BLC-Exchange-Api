const db = require("../models");
const Kyc = db.kyc;
const Op = db.Sequelize.Op;


exports.create = async (req, res) => {

  console.log("======kyc", req.body)

  const { fname, lname, doctype, docnumber, dob, idfront, idback, country, user_id } = req.body

  try {
    Kyc.create({ name: fname, lname: lname, doctype: doctype, docnumber: docnumber, dob: dob, idfront: idfront, idback: idback, country: country, user_id:user_id }).then(async (data) => {
      if (data) {
        // console.log(data)
        return res.send({ status: 200, message: "KYC Done succssfully!", data });
      }
    }).catch((e) => {
      console.log(e);
      return res.send({ status: 500, message: "Something Wrong!!!", e });
    })
  }

  catch (error) {
    console.log(error)
    return res.send({ status: 500, message: error });
  }
}