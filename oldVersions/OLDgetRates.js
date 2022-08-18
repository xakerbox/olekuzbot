const axios = require("axios");
const { buyPriceValues, countStartCoinsValue } = require("../cleanCalc");
const format = require("date-fns/format");

const baseUrl =
  "https://testnet.binancefuture.com/fapi/v1/ticker/price?symbol=";

const testUrl = "http://localhost:2345/put-rates";

let lastPrice = 0;

let zakupka = 0;

let investingSum = 50;
let startCounter = 0;
let spendedOnFirstBuy;

let bufferPrice = 0.0705;

const getRates = async (symbol) => {
  try {
    // const { data: response } = await axios.get(`${baseUrl}${symbol}`);
    const { data: response } = await axios.get(testUrl);
    lastPrice = response.price;
    bufferPrice = response.price;
    return response.price;
  } catch (e) {
    console.log("ERROR! Server not tesponsing!");
    lastPrice = bufferPrice;
    return lastPrice;
  }
};

const startTrade = async (coinsBuyQnt) => {
  if (startCounter === 0) {
    const startPrice = await getRates("TRXUSDT");
    spendedOnFirstBuy = coinsBuyQnt * startPrice;
    startCounter = 1;
  }

  return spendedOnFirstBuy;
};

let spentMoney = [0, 0, 0, 0, 0, 0];

let totalIncome = 0;
let coinsPrices;
let coinsQuantity;
let zeroBuyCounter = 0;
let currentTier = [1, 0, 0, 0, 0, 0];

let workedTiers = [0, 0, 0, 0, 0, 0];

(async function main() {
  setInterval(async () => {
    const currentTime = format(new Date(), "dd MMMM kk:mm:ss");

    const currentPrice = await getRates("TRXUSDT");
    if (zeroBuyCounter === 0) {
      coinsPrices = buyPriceValues(+currentPrice, 1);
      coinsQuantity = countStartCoinsValue(coinsPrices, 500, 30);
      spentMoney[0] = await startTrade(coinsQuantity[0]);
      currentTier[0] = 1;
      zeroBuyCounter = 1;
      zakupka += 1;
      workedTiers[0] += 1;
    }

    console.log("Цены усреднений:", JSON.stringify(coinsPrices));
    console.log("Будет куплено монет: ", coinsQuantity);

    console.log(
      "0 averaging baught at price: ",
      spentMoney[0] / coinsQuantity[0]
    );
    console.log(
      "1 averaging baught at price: ",
      spentMoney[1] / coinsQuantity[1]
    );
    console.log(
      "2 averaging baught at price: ",
      spentMoney[2] / coinsQuantity[2]
    );
    console.log(
      "3 averaging baught at price: ",
      spentMoney[3] / coinsQuantity[3]
    );
    console.log(
      "4 averaging baught at price: ",
      spentMoney[4] / coinsQuantity[4]
    );
    console.log(
      "5 averaging baught at price: ",
      spentMoney[5] / coinsQuantity[5],
      "\n"
    );

    console.log("Current tier:", currentTier);

    console.log("Summ of all baught coins: ", spentMoney);
    console.log("Current price: $", parseFloat(currentPrice));
    console.log(
      "Actual value of stack: $",
      currentPrice *
        (coinsQuantity[0] +
          coinsQuantity[1] * currentTier[1] +
          coinsQuantity[2] * currentTier[2] +
          coinsQuantity[3] * currentTier[3] +
          coinsQuantity[4] * currentTier[4])
    );

    const averagePrice =
      (spentMoney[0] * currentTier[0] +
        spentMoney[1] * currentTier[1] +
        spentMoney[2] * currentTier[2] +
        spentMoney[3] * currentTier[3] +
        spentMoney[4] * currentTier[4]) /
      (coinsQuantity[0] +
        coinsQuantity[1] * currentTier[1] +
        coinsQuantity[2] * currentTier[2] +
        coinsQuantity[3] * currentTier[3] +
        coinsQuantity[4] * currentTier[4]);

    console.log("Average price:", averagePrice);

    income =
      (currentPrice * coinsQuantity[0] - spentMoney[0]) * currentTier[0] +
      (currentPrice * coinsQuantity[1] - spentMoney[1]) * currentTier[1] +
      (currentPrice * coinsQuantity[2] - spentMoney[2]) * currentTier[2] +
      (currentPrice * coinsQuantity[3] - spentMoney[3]) * currentTier[3] +
      (currentPrice * coinsQuantity[4] - spentMoney[4]) * currentTier[4];
    console.log("Income on this tier: ", income);
    console.log(
      "Price for income:",
      averagePrice +
        (spentMoney[0] * currentTier[0] * 0.0004 * 2 +
          spentMoney[1] * currentTier[1] * 0.0004 * 2 +
          spentMoney[2] * currentTier[2] * 0.0004 * 2 +
          spentMoney[3] * currentTier[3] * 0.0004 * 2 +
          spentMoney[4] * currentTier[4] * 0.0004 * 2)
    );

    console.log("Total income: ", totalIncome);
    console.log("Total buys: ", zakupka, "\n");
    console.log("Worked tiers: ", workedTiers);
    console.log("TIME NOW:", currentTime, "\n");

    // if (income > 0.03) {
    // if (income >= (averagePrice*0.0008+averagePrice*0.001)) {
    if (
      income >=
      (spentMoney[0] * currentTier[0] * 0.0004 * 2 +
        spentMoney[1] * currentTier[1] * 0.0004 * 2 +
        spentMoney[2] * currentTier[2] * 0.0004 * 2 +
        spentMoney[3] * currentTier[3] * 0.0004 * 2 +
        spentMoney[4] * currentTier[4] * 0.0004 * 2))
      // spentMoney[4] * currentTier[4] * 0.0004 * 2) + averagePrice*0.0001*(coinsQuantity[0]+coinsQuantity[1]+coinsQuantity[2]+coinsQuantity[3]+coinsQuantity[4])
    {
      totalIncome = totalIncome + income;
      startCounter = 0;
      zeroBuyCounter = 0;

      currentTier[0] = 0;
      spentMoney[0] = 0;

      currentTier[1] = 0;
      spentMoney[1] = 0;

      currentTier[2] = 0;
      spentMoney[2] = 0;

      currentTier[3] = 0;
      spentMoney[3] = 0;

      currentTier[4] = 0;
      spentMoney[4] = 0;

      coinsQuantity[0] = 0;
      coinsQuantity[1] = 0;
      coinsQuantity[2] = 0;
      coinsQuantity[3] = 0;
      coinsQuantity[4] = 0;

      coinsPrices[0] = 0;
      coinsPrices[1] = 0;
      coinsPrices[2] = 0;
      coinsPrices[3] = 0;
      coinsPrices[4] = 0;
    }

    if (currentPrice <= coinsPrices[1] && currentTier[1] == 0) {
      startCounter = 0;
      currentTier[1] = 1;
      spentMoney[1] = await startTrade(coinsQuantity[1]);
      startCounter = 1;
      workedTiers[1] += 1;
    }

    if (currentPrice <= coinsPrices[2] && currentTier[2] == 0) {
      startCounter = 0;
      currentTier[2] = 1;
      spentMoney[2] = await startTrade(coinsQuantity[2]);
      startCounter = 1;
      workedTiers[2] += 1;
    }

    if (currentPrice <= coinsPrices[3] && currentTier[3] == 0) {
      startCounter = 0;
      currentTier[3] = 1;
      spentMoney[3] = await startTrade(coinsQuantity[3]);
      workedTiers[3] += 1;
    }

    if (currentPrice <= coinsPrices[4] && currentTier[4] == 0) {
      startCounter = 0;
      currentTier[4] = 1;
      spentMoney[4] = await startTrade(coinsQuantity[4]);
      startCounter = 1;
      workedTiers[4] += 1;
    }
  }, 2000);
})();
