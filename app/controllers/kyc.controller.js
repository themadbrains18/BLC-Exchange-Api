
const db = require("../models");
const Kyc = db.kyc;
const Users = db.users;
const Op = db.Sequelize.Op;


exports.create = async (req, res) => {

  const { fname, lname, doctype, docnumber, dob, idfront, idback, country, user_id, statement } = req.body

  try {
    Kyc.findOne({ where: { user_id: user_id } }).then((user) => {
      if (!user) {
        Kyc.create({ name: fname, lname: lname, doctype: doctype, docnumber: docnumber, dob: dob, idfront: idfront, idback: idback, country: country, user_id: user_id, statement: statement }).then(async (data) => {
          if (data) {
            Users.update({ kycstatus: 'pending' }, {
              where: { id: user_id }
            }).then(result => {
              if (result) {
                return res.send({ status: 200, message: "KYC Done succssfully!", data });
              }
            }).catch((e) => {
              console.log("=====error", e)

            })
            // console.log(data)

          }
        }).catch((e) => {
          console.log(e);
          return res.send({ status: 500, message: "Something Wrong!!!", e });
        })
      }
      else {
        user.update({ name: fname, lname: lname, doctype: doctype, docnumber: docnumber, dob: dob, idfront: idfront, idback: idback, country: country, user_id: user_id, statement: statement }).then(async (data) => {
          if (data) {
            Users.update({ kycstatus: 'pending' }, {
              where: { id: user_id }
            }).then(result => {
              if (result) {
                return res.send({ status: 200, message: "KYC Done succssfully!", data });
              }
            }).catch((e) => {
              console.log("=====error", e)

            })
            // console.log(data)

          }
        }).catch((e) => {
          console.log(e);
          return res.send({ status: 500, message: "Something Wrong!!!", e });
        })
      }
    })

  }

  catch (error) {
    console.log(error)
    return res.send({ status: 500, message: error });
  }
}

exports.kycById = async (req, res) => {
  console.log("=======helloooo")
  try {
    Kyc.findOne({where :{ user_id:req.params.id}}).then(async (result) => {
      if (result) {
       return res.status(200).send(result);
      }
    }).catch((error) => {
      console.error('===========', error);
    })
  } catch (error) {
   return res.status(400).send(error);
  }
 
}