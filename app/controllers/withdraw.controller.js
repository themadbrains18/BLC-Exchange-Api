
const db = require("../models")
const withdraw = db.withdraws;
const assets= db.assets

const  tokenDetail=async(req,res)=>{
    try {
        assets.findOne({where : {userID : req.params.id ,token_id: req.params.type }}).then((asset)=>{
        if(asset){
          
          console.log(asset);
          res.send({status : 200, data : asset})
        }
      }).catch((error)=>{
        console.error('=========', error);
        res.send({status : 500, data : error});
      })
    } catch (error) {
      
    }
  }

  /**
   * get token blances by user id
   */

  const getBlanceByuserID = async (req,res) => {

    let data = await db.sequelize.query(`
    SELECT sum(balance), token_id FROM assets INNER JOIN tokens ON assets.token_id = tokens.id  
    where assets.userID=1 
    GROUP BY assets.token_id 
    ORDER BY assets.token_id ASC `)
    // let data = await assets.findAll({
    //     where: {userID: req.params.id},
    //     attributes: ["token_id", 
    //     [db.sequelize.fn("SUM", db.sequelize.col("userID")), "count_isActive"]
    //     ],
    //     group: "token_id"

    // })

    res.status(200).send(data[0])
  }
  module.exports = {
    tokenDetail,
    getBlanceByuserID
  }


