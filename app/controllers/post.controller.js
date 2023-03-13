
const { posts } = require("../models");
const db = require("../models");
const Post = db.posts;
const assets = db.assets;

const Op = db.Sequelize.Op;


// SELECT balance, token_id FROM blc.assets INNER JOIN blc.tokens ON assets.token_id = 1  
//      where assets.userID=7 and assets.walletType='main_wallet'  

exports.getBlanceByuserID = async (req, res) => {
  const { id } = req.params

  try {
    let data = await db.sequelize.query(`
       SELECT balance, token_id FROM assets INNER JOIN tokens ON assets.token_id = tokens.id  
       where assets.userID=${id} and assets.walletType='main_wallet' `);
    res.status(200).send(data[0])

  } catch (error) {
    res.status(401).send(error)
  }
}

exports.create = async (req, res) => {
  const { usertoken, notes, checked, deadline, method, max_limit, min_limit, quantity, amount, user_id } = req.body

  try {

    let fundFlag = false
    let userAssets = await assets.findAll({ where :{userID: user_id, token_id : usertoken}})

    let mainBalance = userAssets.filter((e) => { return e.walletType === 'main_wallet' })
    let trading_wallet = userAssets.filter((e) => { return e.walletType === 'trading_wallet' })
    let funding_account = userAssets.filter((e) => { return e.walletType === 'funding_account' })

    mainBalance = parseFloat(mainBalance[0]?.balance) > 0 ? parseFloat(mainBalance[0]?.balance) : 0
    trading_wallet = parseFloat(trading_wallet[0]?.balance) > 0 ? parseFloat(trading_wallet[0]?.balance) : 0
    funding_account = parseFloat(funding_account[0]?.balance) > 0 ? parseFloat(funding_account[0]?.balance) : 0

    if (quantity <= (mainBalance)) {
      fundFlag=true;
      await assets.update({ balance: (mainBalance - quantity) },{ where :{userID: user_id, walletType: "main_wallet", token_id: usertoken}})
    } else if (quantity <= (mainBalance + trading_wallet)) {
      fundFlag=true;
      await assets.update({ balance: 0 },{ where :{userID: user_id, walletType: "main_wallet", token_id: usertoken}} )
      await assets.update( { balance: ((mainBalance + trading_wallet) - quantity) }, { where :{userID: user_id, walletType: "trading_wallet", token_id: usertoken}})
    } else if (quantity <= (mainBalance + trading_wallet + funding_account)) {
      fundFlag=true;
      await assets.update({ balance: 0 },{ where :{userID: user_id, walletType: "main_wallet", token_id: usertoken}} )
      await assets.update( { balance: ((mainBalance + trading_wallet) - quantity) }, { where :{userID: user_id, walletType: "trading_wallet", token_id: usertoken}})
      await assets.updateOne({ balance: ((mainBalance + trading_wallet + funding_account) - quantity ) } ,{ where :{userID: user_id, walletType: "funding_wallet", token_id: usertoken}} )
    }

    if(fundFlag){
      Post.create({ token: usertoken, notes: notes, payment_time: deadline, p_method: method, min_limit: min_limit, max_limit: max_limit, quantity: quantity, price: amount, checked: checked, user_id: user_id }).then(async (data) => {
        if (data) {
          return res.send({ status: 200, message: "Post Add succssfully!", data });
        }
      }).catch((e) => {
        console.log(e);
        return res.send({ status: 500, message: "Something Wrong!!!", e });
      })
    }
    
  }

  catch (error) {
    console.log(error)
    return res.send({ status: 500, message: error });
  }
}


exports.getPostByUser=async(req,res)=>{

  try {
    let data = await db.sequelize.query(`
    select post.*,token.symbol from posts as post inner join tokens as token On post.token = token.id where post.user_id = ${req.params.userid} `);
    res.status(200).send(data[0])
  } catch (error) {
    
  }
}

exports.getAllAds=async(req,res)=>{
  try {
    let data = await db.sequelize.query(`select DISTINCT post.*,token.symbol,kyc.name,kyc.lname from blc.posts as post inner join blc.tokens as token On post.token = token.id inner join blc.kycs as kyc on post.user_id = kyc.user_id`);
    res.status(200).send(data[0])
  } catch (error) {
    
  }
}

exports.deletePost=async(req,res)=>{
  try {
    Post.destroy({where : {id : req.params.postid}}).then((result)=>{
      if(result){
        return res.send({status : 200, message :'Post Removed Successfully !.', data : result});
      }
    }).catch((error)=>{
      res.send({status : 500, error : error});
    })
  } catch (error) {
    res.send({status : 500, error : error});
  }
}