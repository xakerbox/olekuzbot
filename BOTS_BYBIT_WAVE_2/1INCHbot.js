const axios = require("axios");
const { buyPriceValues, countStartCoinsValue } = require("../cleanCalc");
const format = require("date-fns/format");
const { buyCoins } = require("../hashing");
const { sendBot, sendErrorMessage } = require("../telegrambot")

//////////////////////////////////////////////
//////////////////////////////////////////////
// PARAMETERS
//////////////////////////////////////////////

const coinName = '1INCHUSDT';
const stackSize = 68 * 10;
const stackDevider = 30;
const middleSplitter = [0.5, 1.1, 2.5, 4, 10];
const fixingIncomeValue = 1.003;

//////////////////////////////////////////////
//////////////////////////////////////////////

const baseUrl =
  "https://testnet.binancefuture.com/fapi/v1/ticker/price?symbol=";

const testUrl = "http://192.168.68.105:2345/put-rates";

const BYBIT_URL_GET_RATES =
  `https://api.bybit.com/v2/public/tickers?symbol=${coinName}`; // ByBit prod endpoint

let lastPrice = 0;
let zakupka = 0;

let startCounter = 0;
let spendedOnFirstBuy;

let bufferPrice = 0.0705; // это не учитывается при старте - это часть теста/ Назуй! нельзя - нужная переменная. Сколько знаков на ADA после запятой?4

const getRates = async () => {
  try {
    // const { data: response } = await axios.get(`${baseUrl}${symbol}`);
    // const { data: response } = await axios.get(testUrl); // Local test endpoint
    const { data: response } = await axios.get(BYBIT_URL_GET_RATES); // ByBit Prod Get Rates
    lastPrice = +response.result[0].last_price;                      // ByBit Prod Get Rates
    bufferPrice = +response.result[0].last_price;                    // ByBit Prod Get Rates

    // console.log(lastPrice);        // Local Test
    // lastPrice = response.price;    // Local Test
    // bufferPrice = response.price;  // Local Test
    // return response.price;
    return +response.result[0].last_price                            // ByBit Prod endpoint
  } catch (e) {
    console.log("ERROR! Server not tesponsing!");
    lastPrice = bufferPrice;
    sendErrorMessage({coin: coinName, error: 'По пизде пошла малина!'})
    return lastPrice;
  }
};

const startTrade = async (coinsBuyQnt, tier) => {
  if (startCounter === 0) {
    const startPrice = await getRates();
    await buyCoins(coinsBuyQnt, coinName, 'Buy')                    // ByBit Prod endpoint
    spendedOnFirstBuy = coinsBuyQnt * startPrice;
    startCounter = 1;

    let message = {
      operation: 'Куплено',
      coin: coinName,
      qnt: coinsBuyQnt,
      price: startPrice,
      summ: spendedOnFirstBuy,
      tier,
    }

    sendBot(message);
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

let summSpentOnAllCoins;
let quantityOfBoughtCoins;
let binanceFeeOnBuy;
let awaitedPriceOnSell;
let averagePrice;

(async function main() {
  setInterval(async () => {
    const currentTime = format(new Date(), "dd MMMM kk:mm:ss");

    const currentPrice = await getRates();
    if (zeroBuyCounter === 0) {
      coinsPrices = await buyPriceValues(+currentPrice, middleSplitter);
      coinsQuantity = await countStartCoinsValue(coinsPrices, stackSize, stackDevider);
      spentMoney[0] = await startTrade(coinsQuantity[0], 'Start');
      spentMoney[0] = Math.round(spentMoney[0]*100000)/100000;
      currentTier[0] = 1;
      zeroBuyCounter = 1;
      zakupka += 1;
      workedTiers[0] += 1;

      summSpentOnAllCoins = 0;
      quantityOfBoughtCoins = 0;
      binanceFeeOnBuy = 0;
      awaitedPriceOnSell = 0;
      averagePrice = 0;
    }
    console.log(`======COIN ====> ${coinName} <=======COIN=======`);
    console.log("Цены усреднений:", JSON.stringify(coinsPrices));
    console.log("Будет куплено монет: ", coinsQuantity);

    console.log(
      "0 averaging baught at price: ",
      Math.round(spentMoney[0] / coinsQuantity[0]*100000)/100000
    );
    console.log(
      "1 averaging baught at price: ",
      Math.round(spentMoney[1] / coinsQuantity[1]*100000)/100000
    );
    console.log(
      "2 averaging baught at price: ",
      Math.round(spentMoney[2] / coinsQuantity[2]*100000)/100000
    );
    console.log(
      "3 averaging baught at price: ",
      Math.round(spentMoney[3] / coinsQuantity[3]*100000)/100000
    );
    console.log(
      "4 averaging baught at price: ",
      Math.round(spentMoney[4] / coinsQuantity[4]*100000)/100000
    );
    console.log(
      "5 averaging baught at price: ",
      Math.round(spentMoney[5] / coinsQuantity[5]*100000)/100000
    );

    console.log("Summ of all baught coins: ", spentMoney);
    console.log("Current price: $", parseFloat(currentPrice));

    summSpentOnAllCoins =
      spentMoney[0] * currentTier[0] +
      spentMoney[1] * currentTier[1] +
      spentMoney[2] * currentTier[2] +
      spentMoney[3] * currentTier[3] +
      spentMoney[4] * currentTier[4] +
      spentMoney[5] * currentTier[5];

    quantityOfBoughtCoins =
      coinsQuantity[0] * currentTier[0] +
      coinsQuantity[1] * currentTier[1] +
      coinsQuantity[2] * currentTier[2] +
      coinsQuantity[3] * currentTier[3] +
      coinsQuantity[4] * currentTier[4] +
      coinsQuantity[5] * currentTier[5];

    console.log("Quantity of bought coins:", quantityOfBoughtCoins);
    console.log("Summ spent on buy all coins:", Math.round(summSpentOnAllCoins/100)*100);

    binanceFeeOnBuy = summSpentOnAllCoins * 0.0006;
    console.log("Binance fee on BUY all coins:", Math.round(binanceFeeOnBuy*100000)/100000);

    const actualValueOfStack =
      currentPrice *
      (coinsQuantity[0] +
        coinsQuantity[1] * currentTier[1] +
        coinsQuantity[2] * currentTier[2] +
        coinsQuantity[3] * currentTier[3] +
        coinsQuantity[4] * currentTier[4] +
        coinsQuantity[5] * currentTier[5]);

    console.log("Actual value of stack: $", actualValueOfStack);

    averagePrice =
      (spentMoney[0] * currentTier[0] +
        spentMoney[1] * currentTier[1] +
        spentMoney[2] * currentTier[2] +
        spentMoney[3] * currentTier[3] +
        spentMoney[4] * currentTier[4] +
        spentMoney[5] * currentTier[5]) /
      (coinsQuantity[0] +
        coinsQuantity[1] * currentTier[1] +
        coinsQuantity[2] * currentTier[2] +
        coinsQuantity[3] * currentTier[3] +
        coinsQuantity[4] * currentTier[4] +
        coinsQuantity[5] * currentTier[5]);

    console.log("Average price:", Math.round(averagePrice*100000)/100000);

    income =
      ((currentPrice * coinsQuantity[0] - spentMoney[0]) * currentTier[0] +
        (currentPrice * coinsQuantity[1] - spentMoney[1]) * currentTier[1] +
        (currentPrice * coinsQuantity[2] - spentMoney[2]) * currentTier[2] +
        (currentPrice * coinsQuantity[3] - spentMoney[3]) * currentTier[3] +
        (currentPrice * coinsQuantity[4] - spentMoney[4]) * currentTier[4] +
        (currentPrice * coinsQuantity[5] - spentMoney[5]) * currentTier[5]) /
      10;
    console.log("Income on this tier: ", income);

    console.log("Total income: ", totalIncome);
    console.log("Total buys: ", zakupka, "\n");
    console.log("Worked tiers: ", workedTiers);
    console.log("TIME NOW:", currentTime);

    const profitablePrice = Math.round((averagePrice * fixingIncomeValue)*100000)/100000;

    console.log("Желаемый курс:", profitablePrice);

    if (currentPrice >= profitablePrice) {
      await buyCoins(+quantityOfBoughtCoins, coinName, "Sell");        //  ByBit Prod endpoint

      let message = {
        operation: 'Продано',
        coin: coinName,
        qnt: quantityOfBoughtCoins,
        price: currentPrice,
        summ: quantityOfBoughtCoins*currentPrice,
        tier: 'Продажа.'
      }

      sendBot(message);

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

      currentTier[5] = 0;
      spentMoney[5] = 0;

      coinsQuantity[0] = 0;
      coinsQuantity[1] = 0;
      coinsQuantity[2] = 0;
      coinsQuantity[3] = 0;
      coinsQuantity[4] = 0;
      coinsQuantity[5] = 0;

      coinsPrices[0] = 0;
      coinsPrices[1] = 0;
      coinsPrices[2] = 0;
      coinsPrices[3] = 0;
      coinsPrices[4] = 0;
      coinsPrices[5] = 0;

      awaitedPriceOnSell = 0;
      quantityOfBoughtCoins = 0;
    }

    if (currentPrice <= coinsPrices[1] && currentTier[1] == 0) {
      startCounter = 0;
      currentTier[1] = 1;
      spentMoney[1] = await startTrade(coinsQuantity[1], '1 усреднение');
      spentMoney[1] = Math.round(spentMoney[1]*100000)/100000
      startCounter = 1;
      workedTiers[1] += 1;
      return
    }

    if (currentPrice <= coinsPrices[2] && currentTier[2] == 0) {
      startCounter = 0;
      currentTier[2] = 1;
      spentMoney[2] = await startTrade(coinsQuantity[2], '2 усреднение');
      spentMoney[2] = Math.round(spentMoney[2]*100000)/100000
      startCounter = 1;
      workedTiers[2] += 1;
      return
    }

    if (currentPrice <= coinsPrices[3] && currentTier[3] == 0) {
      startCounter = 0;
      currentTier[3] = 1;
      spentMoney[3] = await startTrade(coinsQuantity[3], '3 усреднение');
      spentMoney[3] = Math.round(spentMoney[3]*100000)/100000
      workedTiers[3] += 1;
      return
    }

    if (currentPrice <= coinsPrices[4] && currentTier[4] == 0) {
      startCounter = 0;
      currentTier[4] = 1;
      spentMoney[4] = await startTrade(coinsQuantity[4], '4 усреднение');
      spentMoney[4] = Math.round(spentMoney[4]*100000)/100000
      startCounter = 1;
      workedTiers[4] += 1;
      return
    }

    if (currentPrice <= coinsPrices[5] && currentTier[5] == 0) {
      startCounter = 0;
      currentTier[5] = 1;
      spentMoney[5] = await startTrade(coinsQuantity[5], '5 усреднение');
      spentMoney[5] = Math.round(spentMoney[5]*100000)/100000
      startCounter = 1;
      workedTiers[5] += 1;
      return
    }
  }, 3000);
})();
