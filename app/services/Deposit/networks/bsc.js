class BSC_chain {
    chainLink = "https://bsc-dataseed.binance.org/"

    chainSymbol = "BNB"
    
    chainID = 56

    constructor (){

    }

    // Get address history

   async getAddressHistory (address) {
       let response1 =  await fetch("https://api.covalenthq.com/v1/" + this.chainID + "/address/" + address + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&key=ckey_1263655595e54742b4456f86a37")
        .then(response => response.text())
        .then(async (results) => {
            if (results) {
                let data = JSON.parse(results).data.items;
                return data
            }

        })
        return response1
   }
}

module.exports = BSC_chain
