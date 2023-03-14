const db = require("../models");
const Order = db.orders;
const posts = db.posts;
const assets = db.assets;
const users = db.users;
const tokens = db.tokens

const Op = db.Sequelize.Op;

/** Create new order */
exports.create = (req, res) => {
    try {
        // const { post_id, sell_user_id, buy_user_id,token_id, price,quantity,spend_amount, receive_amount,spend_currency, receive_currency, p_method, type } = req.body;

        Order.create(req.body).then(async (result) => {
            if (result) {
                return res.send({ status: 200, data: result,message :"Order create successfully!." });
            }
        }).catch((error) => {
            console.log(error)
            return res.send({ status: 500, error });
        })
    } catch (error) {
        console.log(error)
        return res.send({ status: 500, error });
    }
}

/** Order update after cancel order */
exports.cancelOrder = (req, res) => {
    try {
        const { orderid } = req.body;
        console.log(orderid,'========cancle order id');
        Order.update( { isCanceled: true, inProcess: false,isComplete : false },{ where: { id: orderid } }).then(async (order) => {
            if (order) {
                return res.send({ status: 200, data: order, message: 'Order cancelled successfully!' });
            }
        }).catch((error) => {
            console.log(error);
        })

    } catch (error) {
        console.log(error)
        return res.send({ status: 500, error });
    }
}

/** Order update after complete payment */
exports.updateOrder = async (req, res) => {
    try {
        const { orderid } = req.body;
        Order.update({ inProcess: false, isComplete: true },{ where: { id: orderid } }).then(async (result) => {
            if (result) {
                res.send({ status: 200, data: result, message: 'Payment complete successfully' });
            }
        }).catch((error) => {
            console.log(error);
            res.send({ status: 500, error })
        })
    } catch (error) {
        console.log(error);
        res.send({ status: 500, error })
    }
}

/** Relese assets by seller */
exports.releaseOrder = async (req, res) => {
    console.log(req.body);
    const { orderid,fundCode,userid } = req.body;
    try {
        users.findOne({where :{id : userid, tradingPassword : fundCode}}).then((user)=>{
            if(user){
                Order.update({ isReleased: true, isComplete : false },{ where: { id: orderid } }).then(async (result) => {
                    
                    if (result) {
                        Order.findOne({where :{id : orderid}}).then(async(orderData)=>{
                            if(orderData){
                                await posts.findOne({ where :{id: orderData.post_id}}).then(async (post) => {
                                    if (post) {
                                        console.log('===========here1')
                                        let qty = post.quantity - parseFloat(orderData.receive_amount);
                                        await post.update({ quantity: qty }).then((postUpdate) => {
                                            if (postUpdate) {
                                                console.log('update record');
                                            }
                                        })
                                        console.log('===========here2')
                                        await assets.findOne({ where: { userID: orderData.buy_user_id, walletType: "main_wallet", token_id: orderData.token_id } }).then(async (asset) => {
                                            if (asset) {
                                                console.log('===========here3')
                                                await asset.update({ balance: asset.balance + orderData.receive_amount }).then((updateAsset) => {
                                                    if (updateAsset) {
                                                        console.log('update buyer assets')
                                                    }
                                                }).catch((error) => {
                                                    return res.send({ status: 500, error })
                                                })
                                            }
                                            else {
                                                console.log('===========here4')
                                                assets.create({
                                                    "userID": orderData.buy_user_id,
                                                    "accountType": 'Main Account',
                                                    "token_id": orderData.token_id,
                                                    "balance": orderData.receive_amount,
                                                    "walletType": "main_wallet",
                                                }).then((record) => {
                                                    if (record) {
                                                        console.log('user assets create')
                                                    }
                                                }).catch((err) => {
                                                    console.log(err)
                                                    return res.send({ status: 500, error: err })
                                                })
                                            }
                                        }).catch((error) => {
                                            return res.send({ status: 500, error })
                                        })
                                        console.log('===========here5')
                                        return res.send({ status: 200, data: orderData, message: 'Record Update Successfully!' });
                                    }
                                }).catch((error) => {
                                    return res.send({ status: 500, error })
                                })
                            }
                        })
                        
        
                    }
                }).catch((error) => {
                    return res.send({ status: 500, error })
                })
            }
            else{
               return res.send({status: 400, data : user, message :"user and fund code not matched"});
            }
        })
        

    } catch (error) {
        return res.send({ status: 500, error })
    }
}

/** get user order list by user id */
exports.getOrderList = async (req, res) => {
    try {
        const { userid } = req.params;
        var condition = userid ? { [Op.or]: [{ buy_user_id: userid }, { sell_user_id: userid }] } : null;
        await Order.findAll({ where: condition }).then(async (result) => {
            if (result) {
                res.send({ status: 200, data: result });
            }

        }).catch((error) => {
            console.log(error);
            res.send({ status: 500, error });
        })

    } catch (error) {
        console.log(error);
        res.send({ status: 500, error });
    }
}

/** get order by order id */
exports.getOrderById = async (req, res) => {
    try {
        const { orderid } = req.params;
        
        let data = await db.sequelize.query(`
        select distinct orders.*,user.number,user.email,kyc.name,kyc.lname from blc.orders as orders inner join blc.users as user on orders.sell_user_id = user.id inner join blc.kycs as kyc on user.id = kyc.user_id where orders.id  = ${orderid} `);
        res.status(200).send(data[0])

    } catch (error) {
        console.log(error);
        res.send({ status: 500, error });
    }
}


exports.socketOrder=async(orderid, socket)=>{
    try {
        let data = await db.sequelize.query(`
        select distinct orders.*,user.number,user.email,kyc.name,kyc.lname from blc.orders as orders inner join blc.users as user on orders.sell_user_id = user.id inner join blc.kycs as kyc on user.id = kyc.user_id where orders.id  = ${orderid} `);
        socket.broadcast.emit("order",{data});
    } catch (error) {
        
    }
}

