const db = require("../models")
let users = db.users;
let tokens= db.tokens;

const {createTRXDepositData} = require('./common.controller');
// const { BSC_chain, TRON_chain, ETH_chain } = require("../services/Deposit/networks")

// let bsc = new BSC_chain();

// const saveDepositData = async (req,res) => {
//     const { address } = req.params
//     let bscScan = await bsc.getAddressHistory(address)
//     try {
//         res.status(200).send({message : "me", "bsc": bscScan})
//     } catch (error) {
//         res.status(400).send({message : "error"})
//     }
// }


const saveTrxTransaction=async(req,res)=>{
    try {
        let { userId } = req.body
        let address = await users.findOne({ where :{id: userId}}).then((result) => {
          if (result) {
            return result.trc20Address;
          }
        })
    
        //Get existing token list
        let coinList = await tokens.findAll({}).then((result) => {
          let list = [];
          if (result) {
            result.map((item) => {
              list.push(item.coinName);
            })
            return list;
          }
        })
    
        //Get TRX transaction record using address
        let apiUrl = process.env.TRONAPIURL
        await fetch(apiUrl + address + '/transactions/?limit=200')
          .then(response => response.text())
          .then(async (result) => {
            
            if (result) {
              let data = JSON.parse(result).data;
              if (data.length > 0) {
                let trxHistory = await createTRXDepositData(data, address); //Filter transaction data that deposit only
                if (trxHistory.length > 0) {
                  let saveRecord = await saveDepositRecord(trxHistory, address, userId, res) //save DB
                  if (saveRecord.length > 0) {
                    return res.send({ status: 200, data: 'Tron record save successfully!' })
                  }
                  else {
                    return res.send({ status: 200, data: 'Tron record update successfully!' })
                  }
                }
              }
              else{
                return res.send({ status: 200, data: 'No Record Found!' })
              }
            }
            
          })
          .catch(error => console.log('error', error));
    
      } catch (error) {
        console.log(error);
      }
}

module.exports = {
    saveTrxTransaction
}