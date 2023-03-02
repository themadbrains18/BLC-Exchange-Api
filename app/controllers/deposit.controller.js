const db = require("../models")
const { BSC_chain, TRON_chain, ETH_chain } = require("../services/Deposit/networks")
const Deposit = db.deposit
const Users = db.users
const Token = db.tokens
const UserAsset = db.assets
let bsc = new BSC_chain();
const { createDepositData } = require('../controllers/common.controller')

const saveDepositData = async (req, res) => {
    const { address } = req.params
    let bscScan = await bsc.getAddressHistory(address)
    try {
        res.status(200).send({ message: "me", "bsc": bscScan })
    } catch (error) {
        res.status(400).send({ message: "error" })
    }
}
const saveTransaction = async (req, res) => {

    try {
        const { userId } = req.body;
    
        let chainids = JSON.parse(process.env.CHAINIDS);
        let address = await Users.findOne({ where: { id: userId } }).then((result) => {
            if (result) {
                return result.bep20Address;
            }
        })

        //Get existing token list
        let coinList = await Token.findAll().then((result) => {
            let list = [];
            if (result) {
                result.map((item) => {
                    list.push(item.symbol);
                })
                return list;
            }
        })
      
        let saveRecord = [];

        for (const cid of chainids) {
            // console.log("https://api.covalenthq.com/v1/" + cid + "/address/" + address + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&key=ckey_1263655595e54742b4456f86a37");
            await fetch("https://api.covalenthq.com/v1/" + cid + "/address/" + address + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&key=ckey_1263655595e54742b4456f86a37")
                .then(response => response.text())
                .then(async (result) => {
                    // console.log(JSON.parse(result).data.items,'data from block chain')
                    if (result) {
                        let data = JSON.parse(result).data.items;
                        if (data.length > 0) {
                            let trxHistory = await createDepositData(cid, data, address, coinList, res); //Filter transaction data that deposit only
                            // console.log(trxHistory,'trx History')
                            if (trxHistory.length > 0) {
                                await saveDepositRecord(trxHistory, address, userId, res) //save DB
                            }
                        }
                        saveRecord.push(cid);

                    }
                })
                .catch(error => console.log('error', error));
        }

        if (chainids.length === saveRecord.length) {
            return res.send({ status: 200, data: 'Record Save successfully!' });
        }

    } catch (err) {
        res.status(400).send({ message: "errrrorrr" })
    }

}

/**
 * save transaction record in DB
 */

const saveDepositRecord = async (data, address, userId, res) => {
    let save = [];
    let coinList = await Token.findAll().then((result) => {
        if (result) {
            return result;
        }
    }).catch((error) => {
        console.log(error)
    });

    for (const record of data) {
        await Deposit.findOne({ where: { address: address, tx_hash: record?.tx_hash } }).then(async (findrecord) => {
            // console.log(findrecord, 'Find Record in Deposit DB ');
            if (!findrecord) {
                // console.log('Find Record in Deposit DB 2');
                await Deposit.create({ address: address, coinName: record?.tokenName, network: record?.network, amount: record?.value, tx_hash: record?.tx_hash, successful: record?.successful, blockHeight: record?.block_height, date: record?.block_signed_at }).then(async (result, index) => {
                    // console.log(findrecord, 'create Record in Deposit DB 3');
                    if (result) {
                        let tokenfilter = coinList.filter((item) => {
                            return item.symbol === record?.tokenName
                        })
                        // console.log(tokenfilter, 'token filter');
                        await UserAsset.findOne({ where: { userID: userId, token: record?.tokenName, walletType: 'main_wallet' } }).then(async (findAssets) => {
                            if (findAssets) {
                                let amount = parseFloat(findAssets.balance) + parseFloat(record?.value);
                                findAssets.update({ balance: amount }).then((updateRecord) => {
                                    if (updateRecord) {
                                        console.log('update');
                                    }
                                })
                                // await UserAsset.findOne({ where: { id: findAssets.id } }).then((user) => {
                                //     if (user) {
                                //         UserAsset.update({ balance: amount }).then((updateRecord) => {
                                //             if (updateRecord) {
                                //                 console.log('update');
                                //             }
                                //         })
                                //     }
                                // }).catch((error) => {
                                //     console.log(error);
                                // })
                            }
                            else {
                                await UserAsset.create({
                                    "userID": userId,
                                    "accountType": 'Main Account',
                                    "token_id": tokenfilter[0]._id,
                                    "balance": record?.value,
                                    "walletType": 'main_wallet',
                                }).then((result) => {
                                    console.log('create');
                                }).catch((error) => {
                                    console.log(error);
                                })
                            }
                        })

                        save.push(result)
                    }
                }).catch((err) => {
                    console.log(err)
                    return res.send({ status: 500, data: err });
                })
            }
        }).catch((error) => {
            return res.send({ status: 500, error: error });
        })
    }
    return save;

}







module.exports = {
    saveDepositData,
    saveTransaction
}