const crypto = require("crypto");
const axios = require("axios");
// require("dotenv").config({
//   path: "/Users/vladimir/Documents/TradeBot/ByBitBot/.env",
// });
require("dotenv").config(); // LOCAL TEST
const Binance = require("node-binance-api");
const fs = require("fs");
const format = require("date-fns/format");

const bybit_api_key = process.env.BYBIT_API_KEY;
const bybit_secret = process.env.BYBIT_SECRET_KEY;

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

const hashParams = (params, secret) => {
  return crypto.createHmac("sha256", secret).update(params).digest("hex");
};

// const orderBybit = async (qntCoins, SYMBOL, operation) => {
//   reduceParam = operation === "Buy" ? false : true;

//   console.log("QUANTITY COINS:", qntCoins);
//   console.log("SYMBOL:", SYMBOL);
//   console.log("OPERATION:", operation);

//   const params = `api_key=${bybit_api_key}&close_on_trigger=false&order_type=Market&qty=${qntCoins}&reduce_only=${reduceParam}&side=${operation}&symbol=${SYMBOL}&time_in_force=GoodTillCancel&timestamp=${Date.now()}`;
//   const sign = hashParams(params, bybit_secret);

//   const URI = `${BASE_URI_BUY_SELL}${params}&sign=${sign}`;

//   const { data: result } = await axios.post(URI);
//   console.log("Status order:", result);
// };

const orderBinance = async (qntCoins, SYMBOL, operation) => {
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

    return { avgPrice, origQty, cumQuote };
  }
};

const checkOrderStatus = async (SYMBOL, orderId) => {
  const { avgPrice } = await binance.futuresOrderStatus(SYMBOL, {
    orderId,
  });
  // const resp = await binance.futuresOrderStatus(SYMBOL, {
  //   orderId,
  // });

  // console.log(resp);

  // return resp

  return avgPrice;
};

const getAverageOnPosition = async (symbol) => {
  const { positions } = await binance.futuresAccount();
  const resultResponse = positions.filter((el) => el.symbol === symbol);

  console.log(resultResponse);

  const avrPrice = +resultResponse[0].entryPrice;

  return avrPrice;
};

const getBalance = async (symbol) => {
  const resultRaw = await binance.futuresIncome();
  const realizedPNLs = resultRaw.filter(
    (el) => el.symbol === symbol && el.incomeType === "REALIZED_PNL"
  );
  if (!realizedPNLs.length) {
    return 0;
  }
  const { income } = realizedPNLs[realizedPNLs.length - 1];

  return income;
};

const getQntCoinsInPosition = async (symbol) => {
  const response = await binance.futuresAccount();

  const result = response.positions.filter((coins) => coins.symbol === symbol);
  console.log(result);

  return +result[0].positionAmt;
};

// checkOrderStatus("ADAUSDT", 24162380190);
// orderBinance(21, "CHZUSDT", "Buy");

const getAllOpened = async () => {
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
  let response = [];
  result.forEach((coin) => {
    response.push(
      `\n   🪙 ${coin.positionAmt} ${coin.symbol} (MP: ${coin.entryPrice.toFixed(5)}), PNL: $${coin.unrealizedProfit.toFixed(3)}`
    );
  });
  return `В работе ${response.length} монет:\n${response}`;
};

const getWalletBalance = async () => {
  const result =  await binance.futuresBalance();
  const cleanRes = result.filter(el => el.asset = 'USDT' && el.balance > 500);

  const message = `🏦🏦🏦🏦🏦🏦🏦🏦🏦\n\nБаланс кошелька: $${Math.round(+cleanRes[0].balance*100)/100},\nНереализ PNL: $${Math.round(+cleanRes[0].crossUnPnl*100)/100}`
  return message;

}


module.exports = {
  orderBinance,
  checkOrderStatus,
  getAverageOnPosition,
  getBalance,
  getQntCoinsInPosition,
  getAllOpened,
  getWalletBalance,
};
