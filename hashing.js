const crypto = require("crypto");
const axios = require("axios");
require('dotenv').config();

const BASE_URI_BUY_SELL = process.env.BYBIT_BASE_URI_CREATE_ORDER

const BASE_URI_SELL = "https://api.bybit.com/private/linear/order/cancel?";
// const BASE_URI_WALLET = "https://api.bybit.com/v2/private/wallet/balance?";

const api_key = process.env.BYBIT_API_KEY;
const secret = process.env.BYBIT_SECRET_KEY;

const hashingParams = (params) => {
  return crypto
    .createHmac("sha256", secret)
    .update(params)
    .digest("hex");
};

// const getInfo = async () => {
//   const { data: result } = await axios.get(BASE_URI_WALLET);
//   console.log("USDT Balance", result.result.USDT);
// };

const buyCoins = async (qntCoins, SYMBOL, operation) => {
  reduceParam = operation === "Buy" ? false : true;

  console.log('QUANTITY COINS:', qntCoins);
  console.log('SYMBOL:', SYMBOL);
  console.log('OPERATION:', operation);

  const params = `api_key=${api_key}&close_on_trigger=false&order_type=Market&qty=${qntCoins}&reduce_only=${reduceParam}&side=${operation}&symbol=${SYMBOL}&time_in_force=GoodTillCancel&timestamp=${Date.now()}`;
  const sign = hashingParams(params);

  const URI = `${BASE_URI_BUY_SELL}${params}&sign=${sign}`;

  const { data: result } = await axios.post(URI);
  console.log("Status order:", result);
};

module.exports = { buyCoins };
