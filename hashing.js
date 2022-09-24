const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config({
  path: "/Users/vladimir/Documents/TradeBot/ByBitBot/.env",
});
const { getRunnedOrNot } = require('./utils/checkrun')
// require("dotenv").config(); // LOCAL TEST
const Binance = require("node-binance-api");
const fs = require("fs");
const format = require("date-fns/format");
const { checkRunBot } = require("./utils/checkrun");

const binance_api_key = process.env.BINANCE_API_KEY;
const binance_secret = process.env.BINANCE_API_SECRET;

const binance = new Binance().options({
  APIKEY: binance_api_key,
  APISECRET: binance_secret,
});

const BASE_URI_BUY_SELL = process.env.BYBIT_BASE_URI_CREATE_ORDER;
const BASE_BINANCE_URI_ORDER = process.env.BINANCE_BASE_URI_ORDER;

// const BASE_URI_SELL = "https://api.bybit.com/private/linear/order/cancel?";
// const BASE_URI_WALLET = "https://api.bybit.com/v2/private/wallet/balance?";

// const hashParams = (params, secret) => {
//   return crypto.createHmac("sha256", secret).update(params).digest("hex");
// };

const orderBinance = async (qntCoins, SYMBOL, operation) => {
  try{
    if (operation === "Buy") {
      const result = await binance.futuresMarketBuy(SYMBOL, qntCoins);
  
      console.log("Result on buy in HASHING:", result);
      const { orderId, cumQuote } = result;
  
      if (!fs.existsSync(`./${SYMBOL}_logs`)) {
        fs.writeFileSync(`./${SYMBOL}_logs`, `LOGS FOR ${SYMBOL}\n`);
      }
      const logsRow = `${format(
        new Date(),
        "dd.MM, EEEE, HH:mm:ss"
      )} | #${orderId} ${SYMBOL}: ${operation} ---- ${qntCoins} by $${
        cumQuote / qntCoins
      } per coin\n`;
      fs.appendFileSync(`./${SYMBOL}_logs`, logsRow);
  
      return orderId;
    }
  
    if (operation === "Sell") {
      const { orderId, avgPrice, cumQuote, origQty } =
        await binance.futuresMarketSell(SYMBOL, qntCoins);
  
      if (!fs.existsSync(`./${SYMBOL}_logs`)) {
        fs.writeFileSync(`./${SYMBOL}_logs`, `LOGS FOR ${SYMBOL}\n`);
      }
      const logsRow = `${format(
        new Date(),
        "dd.MM, EEEE, HH:mm:ss"
      )} | #${orderId} ${SYMBOL}: ${operation} ---- ${qntCoins} by $${
        cumQuote / qntCoins
      } per coin\n`;
      fs.appendFileSync(`./${SYMBOL}_logs`, logsRow);

      console.log(`Successfully sell ${qntCoins} ${SYMBOL}`)
  
      return { avgPrice, origQty, cumQuote };
    }
  } catch(e) {
    console.log('Error in orderBinance method.', e)
  }
  
};

const checkOrderStatus = async (SYMBOL, orderId) => {
  try {
    const { avgPrice } = await binance.futuresOrderStatus(SYMBOL, {
      orderId,
    });
  
    return avgPrice;
  } catch(e) {
    console.log('Error in checkOrderStatus method.', e)
  }

};

const getAverageOnPosition = async (symbol) => {
  try {
    const { positions } = await binance.futuresAccount();
    const resultResponse = positions.filter((el) => el.symbol === symbol);
  
    const avrPrice = +resultResponse[0].entryPrice;
    console.log(avrPrice);
  
    return avrPrice;
  } catch(e) {
    console.log('Error in getAverageOnPosition block. Getting futureAccount.', e);
  }

};

const getBalance = async (symbol) => {
  try {
    const resultRaw = await binance.futuresIncome();
    const realizedPNLs = resultRaw.filter(
      (el) => el.symbol === symbol && el.incomeType === "REALIZED_PNL"
    );
    if (!realizedPNLs.length) {
      return 0;
    }
    const { income } = realizedPNLs[realizedPNLs.length - 1];
  
    return income;
  } catch(e) {
    console.log('Error in getBalance method.', e)
  }

};

const getQntCoinsInPosition = async (symbol) => {
  const response = await binance.futuresAccount();

  const result = response.positions.filter((coins) => coins.symbol === symbol);
  console.log(result);

  return +result[0].positionAmt;
};

const getPossitionsInWorkOnBinance = async () => {
  const { positions } = await binance.futuresAccount();
  const openedPositions = positions.filter(
    (position) => +position.positionAmt != 0
  );

  const result = openedPositions.map((position) => {
    return {symbol: position.symbol.slice(0, -4)};
  });

  return result;
}

const getAllOpened = async () => {
  const { positions } = await binance.futuresAccount();
  const openedPositions = positions.filter(
    (position) => +position.positionAmt != 0
  );
  const result = openedPositions.map((position) => {
    const pnlPercents = Math.round((+position.unrealizedProfit/ (+position.positionAmt * +position.entryPrice))*1000*100)/100

    return {
      symbol: position.symbol.slice(0, -4),
      entryPrice: +position.entryPrice,
      positionAmt: +position.positionAmt,
      unrealizedProfit: +position.unrealizedProfit,
      pnlPercents,
    };
  });

  const sorted = result.sort((a, b) => b.unrealizedProfit - a.unrealizedProfit);

  let response = [];

  for (coin of sorted) {
    const stat = await getRunnedOrNot(coin);
    if (coin.pnlPercents > 0) {
      coin.pnlPercents = `+${coin.pnlPercents.toString()}`
    }
    response.push(
      `\n   ${stat} <b>${
        coin.positionAmt
      }</b> <a href='https://www.binance.com/en/futures/${coin.symbol}usdt'>${
        coin.symbol
      }</a> | $${coin.unrealizedProfit.toFixed(3)} | ${coin.pnlPercents}%`
    );
  }
  return `В работе <b>${response.length} монет</b>:\n${response}`;
};

const getWalletBalance = async () => {
  const result = await binance.futuresBalance();
  const cleanRes = result.filter(
    (el) => (el.asset = "USDT" && el.balance > 500)
  );

  const message = `\n\n🏦 Баланс кошелька: $${
    Math.round(+cleanRes[0].balance * 100) / 100
  },\nНереализ PNL: $${Math.round(+cleanRes[0].crossUnPnl * 100) / 100}`;
  return message;
};

const getCurrentBalance = async () => {
  const result = await binance.futuresBalance();
  const cleanRes = result.filter(
    (el) => (el.asset = "USDT" && el.balance > 500)
  );
  const valueToStore = `${format(new Date(), "dd.MM HH:mm:ss")},${
    Math.round(+cleanRes[0].balance * 100) / 100
  }\n`;
  fs.appendFileSync("./balanceHistory.csv", valueToStore);
  console.log(`${format(new Date(), "dd.MM HH:mm:ss")} | Record created.`)
  return;
};


const notifyAtProfitpened = async () => {
  const { positions } = await binance.futuresAccount();
  const openedPositions = positions.filter(
    (position) => +position.positionAmt != 0
  );
  const result = openedPositions.map((position) => {
    return {
      symbol: position.symbol.slice(0, -4),
      entryPrice: +position.entryPrice,
      positionAmt: +position.positionAmt,
      unrealizedProfit: +position.unrealizedProfit,
    };
  });

  const sorted = result.sort((a, b) => b.unrealizedProfit - a.unrealizedProfit);

  let response = [];

  for (coin of sorted) {
    const stat = await getRunnedOrNot(coin);
    response.push({coin: coin.symbol, pnl: coin.unrealizedProfit.toFixed(3), status: stat})
  }
  return response;
};


// const getPnl = async () => {
//   const { positions } = await binance.futuresAccount();
//   const openedPositions = positions.filter(
//     (position) => +position.positionAmt != 0
//   );

//   console.log(openedPositions);
//   const result = openedPositions.map((position) => {
//     return {
//       symbol: position.symbol.slice(0, -4),
//       entryPrice: +position.entryPrice,
//       positionAmt: +position.positionAmt,
//       unrealizedProfit: +position.unrealizedProfit,
//       notional: +position.notional,
//     };
//   });
// }



//  15.61252 - куплено
//  15.64878 - актуальная
// +2.15%


// 15,5288
// 15.55049961
// Long position floating PNL = Position Size × (Index Price - Cost Price);


// getPnl();

const getNotRunned = async() => {
  const { positions } = await binance.futuresAccount();
  const openedPositions = positions.filter(
    (position) => +position.positionAmt != 0
  );

  const workingStack  = openedPositions.map(pos => {
    return {
      symbol: pos.symbol.slice(0,-4),
      qty: pos.positionAmt,
    }
  })

  const arrayOfNotRunnedCoins = [];

  for (position of workingStack) {
    const coinStatus = await getRunnedOrNot(position);
    if (coinStatus === '🔴') {
      arrayOfNotRunnedCoins.push({
        symbol: position.symbol,
        qty: position.qty,
      })
    }
  }

  return arrayOfNotRunnedCoins;
}

getNotRunned();

module.exports = {
  orderBinance,
  checkOrderStatus,
  getAverageOnPosition,
  getBalance,
  getQntCoinsInPosition,
  getAllOpened,
  getWalletBalance,
  getCurrentBalance,
  getPossitionsInWorkOnBinance,
  notifyAtProfitpened,
  getNotRunned,
};
