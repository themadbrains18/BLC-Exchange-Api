const db = require("../models")
const { BSC_chain, TRON_chain, ETH_chain } = require("../services/Deposit/networks")

let bsc = new BSC_chain();

const saveDepositData = async (req,res) => {
    const { address } = req.params
    let bscScan = await bsc.getAddressHistory(address)
    try {
        res.status(200).send({message : "me", "bsc": bscScan})
    } catch (error) {
        res.status(400).send({message : "error"})
    }
}

module.exports = {
    saveDepositData
}