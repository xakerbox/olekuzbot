const crypto = require("crypto");
const axios = require("axios");

const BASE_URI_BUY_SELL = "https://api.bybit.com/private/linear/order/create?";

const BASE_URI_SELL = "https://api.bybit.com/private/linear/order/cancel?";
// const BASE_URI_WALLET = "https://api.bybit.com/v2/private/wallet/balance?";

const api_key = "xtnMhAXlnpRWANdIQq";
const secret = "dEAE8ElH7rhM3C2P9pMFkM8hvGaBCVx2Za1n";

const hashingParams = (params) => {
  return crypto
    .createHmac("sha256", "dEAE8ElH7rhM3C2P9pMFkM8hvGaBCVx2Za1n")
    .update(params)
    .digest("hex");
};

const getInfo = async () => {
  const { data: result } = await axios.get(CORRECT_URI);
  console.log("USDT Balance", result.result.USDT);
};

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

// buyCoins(1, "DOGEUSDT", "Sell")

module.exports = { buyCoins };
