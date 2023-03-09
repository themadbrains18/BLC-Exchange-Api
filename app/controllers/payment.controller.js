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
  try {
    let newRecord = await db.userpaymentmethod.create(req.body)
    res.status(200).send({message : "Payment method added successfully...", result : newRecord})
  } catch (error) {
    res.status(401).send(error)
  }
}


const getMethod = async (req, res) => {
  const {id } = req.params

  try {

    

    let getDataByid = await db.sequelize.query('select * from blc.userpaymentmethods as upm inner join blc.payment_methods as pms where upm.pmid = pms.id and upm.user_id='+id)

    res.status(200).send(getDataByid[0])

  } catch (error) {
    res.status(401).send(error) 
  }
}




module.exports = {
  create,
  list,
  single,
  addMethod,
  getMethod
}
