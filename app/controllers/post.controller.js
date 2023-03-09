
const db = require("../models");
const Post = db.posts;

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
    Post.create({ token: usertoken, notes: notes, payment_time: deadline, p_method: method, min_limit: min_limit, max_limit: max_limit, quantity: quantity, price: amount, checked: checked, user_id: user_id }).then(async (data) => {
      if (data) {
        return res.send({ status: 200, message: "Post Add succssfully!", data });
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