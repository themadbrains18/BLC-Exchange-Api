const db = require("../models");
const Payment_Method = db.paymentmethod;
const Op = db.Sequelize.Op;


const create=(req,res)=>{
  try {
    Payment_Method.create(req.body).then((result)=>{
      if(result){
        res.send({status : 200, message : 'Record Save Successfully !.'})
      }
    }).catch((error)=>{
      console.error('=======', error);
      res.send({status : 500, data : error});
    })
  } catch (error) {
    console.error('======= try catch error', error);
      res.send({status : 500, data : error});
  }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * get all method list
 */
const list = async ( req, res) => {
    try {
      let list = await db.paymentmethod.findAll({})
      res.status(200).send(list)
    } catch (error) {
      res.status(401).send(error) 
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * get single method by id
 */

const single = async ( req, res) => {
  const {id} = req.params
  try {
    let list = await db.paymentmethod.findOne({ where : { id : id}})
    res.status(200).send(list)
  } catch (error) {
    res.status(401).send(error) 
  }
}

/**
 * create new method for users
 */
const addMethod = async (req , res) => {
  console.log(req.body)
  const {user_id} = req.body;
  try {
    let passCodeVerify = await db.users.findOne({
      where : {id : user_id},
      attributes: {
        exclude: ['id', 'number', 'email', 'dial_code', 'passwordHash', 'bep20Address', 'bep20Hashkey', 'trc20Address', 'trc20Hashkey', 'TwoFA', 'kycstatus', 'statusType', 'registerType', 'role', 'secret', 'own_code', 'refeer_code', 'antiphishing', 'createdAt', 'updatedAt', 'UID']
      },
    })

    if(passCodeVerify.tradingPassword != ""){
      console.log(passCodeVerify.tradingPassword, ' passCodeVerify.tradingPasswordpassCodeVerify.tradingPassword',req.body.passcode)
       if(passCodeVerify.tradingPassword === req.body.passcode){
               let newRecord = await db.userpaymentmethod.create(req.body)
               res.status(200).send({res : "success",message : "Payment method added successfully...", result : passCodeVerify})
       }else{
         res.status(401).send({res : "fail", message : "Your passcode is wrong. Please try again."})
       }
    }else{
      res.status(401).send({res : "fail",message : "Your trading password is not create."})
    }


  } catch (error) {
    res.status(401).send(error)
  }
}

/**
 * get payment method by use id
 * @param {*} req 
 * @param {*} res 
 */

const getMethod = async (req, res) => {
  const {id } = req.params

  try {

    

    let getDataByid = await db.sequelize.query('select upm.id, upm.user_id, upm.pmid, upm.status, upm.pm_name, upm.pmObject,pms.id as pms, pms.icon, pms.region from blc.userpaymentmethods as upm inner join blc.payment_methods as pms where upm.pmid = pms.id and upm.user_id='+id)

    res.status(200).send(getDataByid[0])

  } catch (error) {
    res.status(401).send(error) 
  }
}


/**
 * delete request by method id
 */

const deleteRequest = async (req, res) => {
  const {id } = req.params
  try {
   let result =  await db.userpaymentmethod.destroy({where : {id : id}});
   res.status(200).send({ message : "Payment method successfully deleted!", result : result})
  } catch (error) {
    res.status(401).send(error)
  }
}

module.exports = {
  create,
  list,
  single,
  addMethod,
  getMethod,
  deleteRequest
}
