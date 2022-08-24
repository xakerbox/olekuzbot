const crypto = require("crypto");
const axios = require("axios");
require('dotenv').config({ path: '/Users/vladimir/Documents/TradeBot/ByBitBot/.env' });
// require("dotenv").config();
const Binance = require("node-binance-api");

const bybit_api_key = process.env.BYBIT_API_KEY;
const bybit_secret = process.env.BYBIT_SECRET_KEY;

const binance_api_key = process.env.BINANCE_API_KEY;
const binance_secret = process.env.BINANCE_API_SECRET;

const binance = new Binance().options({
  APIKEY: binance_api_key,
  APISECRET: binance_secret,
});

const BASE_URI_BUY_SELL = process.env.BYBIT_BASE_URI_CREATE_ORDER;
console.log("BASE_URI", BASE_URI_BUY_SELL);
const BASE_BINANCE_URI_ORDER = process.env.BINANCE_BASE_URI_ORDER;

// const BASE_URI_SELL = "https://api.bybit.com/private/linear/order/cancel?";
// const BASE_URI_WALLET = "https://api.bybit.com/v2/private/wallet/balance?";

const hashParams = (params, secret) => {
  return crypto.createHmac("sha256", secret).update(params).digest("hex");
};

const orderBybit = async (qntCoins, SYMBOL, operation) => {
  reduceParam = operation === "Buy" ? false : true;

  console.log("QUANTITY COINS:", qntCoins);
  console.log("SYMBOL:", SYMBOL);
  console.log("OPERATION:", operation);

  const params = `api_key=${bybit_api_key}&close_on_trigger=false&order_type=Market&qty=${qntCoins}&reduce_only=${reduceParam}&side=${operation}&symbol=${SYMBOL}&time_in_force=GoodTillCancel&timestamp=${Date.now()}`;
  const sign = hashParams(params, bybit_secret);

  const URI = `${BASE_URI_BUY_SELL}${params}&sign=${sign}`;

  const { data: result } = await axios.post(URI);
  console.log("Status order:", result);
};

const orderBinance = async (qntCoins, SYMBOL, operation) => {
  operation === "Buy"
    ? console.info(await binance.futuresMarketBuy(SYMBOL, qntCoins))
    : console.info(await binance.futuresMarketSell(SYMBOL, qntCoins));
};

module.exports = { orderBybit, orderBinance };
