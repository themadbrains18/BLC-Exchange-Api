
const db = require("../models")
const withdraw = db.withdraws;
const assets= db.assets

const  tokenDetail=async(req,res)=>{
    try {
        assets.findOne({where : {userID : req.params.id ,token_id: req.params.type }}).then((asset)=>{
        if(asset){
          
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
    const { id } = req.params

   try {
     let data = await db.sequelize.query(`
     SELECT sum(balance), token_id FROM assets INNER JOIN tokens ON assets.token_id = tokens.id  
     where assets.userID=${id} 
     GROUP BY assets.token_id 
     ORDER BY assets.token_id ASC `);
     res.status(200).send(data[0])
    
   } catch (error) {
      res.status(401).send(error)
     }
  }


  /**
   * add new request
   */
  var EPSILON = 0.000001;

  function fp_less_than(A, B, Epsilon) {
      Epsilon = Epsilon || EPSILON;
      return (A - B < Epsilon) && (Math.abs(A - B) > Epsilon);
  };
  
  function fp_greater_than(A, B, Epsilon) {
      Epsilon = Epsilon || EPSILON;
      return (A - B > Epsilon) && (Math.abs(A - B) > Epsilon);
  };

  const addnewRequest = async (req , res) => {
      try {

        const {userid, usernetwork, usertoken, userwallet, withdrawAmont} = req.body
        

        // ========================= get requested user assests list 
        let letgetAssestsbyID = await assets.findAll({
          attributes : ['id', 'userID', 'accountType', 'walletType', 'token_id', 'balance', 'createdAt', 'updatedAt'],
          where : {
            userID : userid,
            token_id : usertoken.id
          }
        })



        if(letgetAssestsbyID){

          // get all balance sepratly 
          let mainBalance = letgetAssestsbyID.filter((e) => { return e.walletType === 'main_wallet' })
          let trading_wallet = letgetAssestsbyID.filter((e) => { return e.walletType === 'trading_wallet' })
          let funding_account = letgetAssestsbyID.filter((e) => { return e.walletType === 'funding_wallet' })


          mainBalance = parseFloat(mainBalance[0]?.balance) > 0 ? parseFloat(mainBalance[0]?.balance) : 0
          trading_wallet = parseFloat(trading_wallet[0]?.balance) > 0 ? parseFloat(trading_wallet[0]?.balance) : 0
          funding_account = parseFloat(funding_account[0]?.balance) > 0 ? parseFloat(funding_account[0]?.balance) : 0


       
          let tokenAmount = parseFloat(withdrawAmont);

          let selectedNetwork = JSON.parse(usertoken.networks).filter((e) => { return e.id == usernetwork })
          let fees = parseFloat(selectedNetwork[0]?.fee)
          

          let networkDetails = await db.networks.findOne( { 
            where : { id : selectedNetwork[0]?.id}
          })


          let fundFlag = false;
          let flagTag = false;

        //   //****************************************//
        //   // if user pass any over amount //
        //   //****************************************//
          let availabeBalances = (mainBalance + trading_wallet + funding_account - fees)

          if (fp_less_than(availabeBalances, tokenAmount)) {
              return res.status(401).send({ message: `Your balance is low after fee deduction. Your entred value ${tokenAmount} -- Transaction Fees ${selectedNetwork[0]?.fee} --- Available ${(availabeBalances)}` })
          } 


          if (tokenAmount <= (mainBalance + fees)) {
            flagTag = 'main' // main means sufficient balance make a request 
            fundFlag = true


            let reslt = await db.assets.update(
              { balance : (parseFloat(mainBalance) - (tokenAmount + fees)) },
              {where : {
                userID : userid,
                token_id : usertoken.id,
                walletType : "main_wallet"
              }
             }
            )
            
           } else if (tokenAmount <= (mainBalance + trading_wallet - fees)) {
            flagTag = 'trading' // main means sufficient balance make a request 
            fundFlag = true
            
            await assets.update({ balance : 0},
              { where : {
                userID : userid,
                token_id : usertoken.id,
                walletType : "main_wallet"
              }
            })

            console.log(((mainBalance + trading_wallet) - (tokenAmount + fees)), 'trading_wallet')

            await assets.update({
              balance : ((mainBalance + trading_wallet) - (tokenAmount + fees))},
             { where : {
                userID : userid,
                token_id : usertoken.id,
                walletType : "trading_wallet"
              }
            })

        } else if (tokenAmount <= (mainBalance + trading_wallet + funding_account + fees)) {
            flagTag = 'funding' // main means sufficient balance make a request 
            fundFlag = true

            await assets.update({
              balance : 0},
              {where : {
                userID : userid,
                token_id : usertoken.id,
                walletType : "main_wallet"
              }
            })

            await assets.update({
              balance : 0},
              {where : {
                userID : userid,
                token_id : usertoken.id,
                walletType : "trading_wallet"
              }
            })

            await assets.update({
              balance : ((mainBalance + trading_wallet + funding_account) - (tokenAmount + fees))},
              {where : {
                userID : userid,
                token_id : usertoken.id,
                walletType : "funding_wallet"
              }
            })

            // await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "main_wallet", token: coinName }, { balance: 0 })
            // await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "trading_wallet", token: coinName }, { balance: 0 })
            // await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "funding_wallet", token: coinName },
            //  { balance: ((mainBalance + trading_wallet + funding_account) - (tokenAmount + fees)) })
          }

        // console.log(networkDetails)

          // direct payment BNB/TRX/

          console.log(fundFlag, ' === fundFlag')

          if (fundFlag) {

            // id, symbol, tokenName, withdraw_wallet, amount, status, user_id, tx_hash, tx_type, requestedAmount, fee, networkId, type, createdAt, updatedAt

            let dataReq = {
              symbol: usertoken?.symbol, // c
              tokenName : usertoken?.fullName, // c
              tokenID : usertoken?.id,
              withdraw_wallet: userwallet, // c
              amount: tokenAmount, // c
              status: 'pending', // c
              user_id: userid, // c
              tx_hash: '', // c
              tx_type: '',
              requestedAmount: tokenAmount, // c
              fee: fees, // c
              networkId : usernetwork, // c
              type: networkDetails?.network,  // c

                // tekenRequest: selectedNetwork[0]?.id,
                // requestObj: networkDetails, // c
            }

            console.log(dataReq)

             let wdr = await db.withdraws.create(dataReq)

            return  res.status(200).send({message : "Withdraw request successfully submitted..", results : wdr})            
          }

          return res.status(200).send(letgetAssestsbyID)

        }else{
          res.status(401).send('Opps: You don\'t have any fund under this portfolio...');
        }
        
      } catch (error) {
         res.status(401).send(error)
      }
  }

  /**
   * 
   */

const withdrawListbyTekenAndUserID = async (req, res) => {
  const { tokenid, userid} = req.params
  try {
    data = await db.withdraws.findAll({
      where: { user_id : userid} 
    })
    res.status(200).send(data);


  } catch (error) {
    res.status(401).send(error)
  }
}

  module.exports = {
    tokenDetail,
    getBlanceByuserID,
    addnewRequest,
    withdrawListbyTekenAndUserID
  }


