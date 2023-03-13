const express = require("express");
const db = require("../models");

const tokens = db.tokens;

exports.tokenAll = async (req, res) => {
  tokens.findAll().then(async (result) => {
    if (result) {
      res.status(200).send(result);
    }
  }).catch((error) => {
    console.error('===========', error);
  })
}

exports.getMarketCoin = async (req, res) => {
  try {
    tokens.findAll({}).then(async (result) => {
      if (result) {
        let symbol = '';
        for (const d of result) {
          if (symbol == '') {
            symbol = d.symbol
          }
          else {
            symbol += ',' + d.symbol;
          }
        }

        let coins = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + symbol + '&tsyms=USDT&api_key=' + process.env.MIN_API_KEY).then(response =>
          response.json()
        ).then(result => { return result; })
          .catch(console.error);

          console.log(coins, ' === coins v coins')


        let coinsArray = [];

        result.forEach(item => {
          let obj = coins.RAW[item.symbol]['USDT'];
          let coinData = {
            'PRICE': item.tokenType === 'global'? obj.PRICE : item.price,
            'FROMSYMBOL': obj.FROMSYMBOL,
            'CHANGE24HOUR': obj.CHANGE24HOUR,
            'VOLUME24HOUR': obj.VOLUME24HOUR,
            'HIGH24HOUR' : obj.HIGH24HOUR,
            'LOW24HOUR' : obj.LOW24HOUR,
            'TOSYMBOL': obj.TOSYMBOL,
            'TOKENLOGOURL': item.image,
            'TOKENTYPE': item.tokenType,
            'FULLNAME': item.fullName,
            'SYMBOL': item.symbol,
            'ID' : item.id
          }
          coinsArray.push(coinData);
        })

        return res.send({ status: 200, data: coinsArray });
      }
    }).catch((error) => {
      console.error('===========', error);
    })
  } catch (error) {

  }
}