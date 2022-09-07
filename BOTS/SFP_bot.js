const axios = require("axios");
const { buyPriceValues, countStartCoinsValue } = require("../cleanCalc");
const format = require("date-fns/format");
const { rounder } = require("../utils/rounder");
const {
  orderBinance,
  checkOrderStatus,
  getAverageOnPosition,
  getBalance,
  getQntCoinsInPosition,
} = require("../hashing");
const { sendBot, sendErrorMessage } = require("../telegrambot");
require("dotenv").config({
  path: "/Users/vladimir/Documents/TradeBot/ByBitBot/.env",
});

///////////////////////////////////////////
//////////////////////////////////////////////
// PARAMETERS
//////////////////////////////////////////////

const coinName = "SFPUSDT";
let stackValue = 72;
const stackSize = stackValue * 10;
const stackDevider = 30;
const middleSplitter = [0.6, 1.3, 2.7, 6, 10];
const fixingIncomeValue = 1.003;
const decimals = 5; // Количество знаков после запятой в округлениях.

// const secondBuyPause = 5; // seconds from last sell
// const thirdBuyPause = 30; //seconds from last sell
// const fourthBuyPause = 90; //seconds

//////////////////////////////////////////////
//////////////////////////////////////////////
const testUrl = "http://localhost:2345/put-rates";

// const BYBIT_URL_GET_RATES = `${process.env.BYBIT_BASE_URI_GET_RATES}${coinName}`; // ByBit prod endpoint
const BINANCE_URL_GET_RATES = `https://api.binance.com/api/v3/ticker/price?symbol=${coinName}`;

let lastPrice = 0;
let zakupka = 0;

let priceToSell = 0;

let startCounter = 0;
let spendedOnFirstBuy;
let actualBoughtCoins;

let bufferPrice = 0; 

let sendMessageTrigger = 1;
let tier = "Start";
let coinsQntMessage = 0;

let spentMoney = [0, 0, 0, 0, 0, 0];

let coinsPrices;
let coinsQuantity;
let zeroBuyCounter = 0;
let currentTier = [1, 0, 0, 0, 0, 0];

let workedTiers = [0, 0, 0, 0, 0, 0];

let summSpentOnAllCoins;
let quantityOfBoughtCoins;
let realOrderPrice;

let sellCounter = 0;

const timer = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, 2000);
  });
};

const getRates = async () => {
  try {
    // const { data: response } = await axios.get(testUrl); // Local test endpoint

    // const { data: response } = await axios.get(BYBIT_URL_GET_RATES); // ByBit Prod Get Rates
    // lastPrice = +response.result[0].last_price; // ByBit Prod Get Rates
    // bufferPrice = +response.result[0].last_price; // ByBit Prod Get Rates

    const { data: response } = await axios.get(BINANCE_URL_GET_RATES); // Binance Prod Get Rates

    console.log("NEW RESPONSE", response);
    lastPrice = +response.price; // Binance Prod Get Rates
    bufferPrice = +response.price; // Binance Prod Get Rates

    // console.log(lastPrice); // Local Test
    // lastPrice = response.price; // Local Test
    // bufferPrice = response.price; // Local Test
    // return response.price; // Local Test

    // return +response.result[0].last_price; // ByBit Prod endpoint
    return +response.price;
  } catch (e) {
    console.log("ERROR! Server not responsing!");
    lastPrice = bufferPrice;
    sendErrorMessage({ coin: coinName, error: "По пизде пошла малина!" });
    return lastPrice;
  }
};

const startTrade = async (coinsBuyQnt) => {
  if (startCounter === 0) {

    try {
      const startPrice = await getRates();
      console.log("Курс покупки (опрошенная):", startPrice);
      console.log('Параметры для ORDERID:', coinsBuyQnt, coinName);

      const orderId = await orderBinance(coinsBuyQnt, coinName, "Buy"); // Binance Prod endpoint
      console.log('ORDER ID:', orderId);
      realOrderPrice = await checkOrderStatus(coinName, orderId);
  
      priceToSell = await getAverageOnPosition(coinName);
  
      console.log("Реальный курс сделки: ", realOrderPrice);
    } catch(e) {
      console.log(e);
    }


    if (currentTier[1] === 0) {
      coinsPrices = await buyPriceValues(+realOrderPrice, middleSplitter);
      coinsQuantity = await countStartCoinsValue(
        coinsPrices,
        stackSize,
        stackDevider
      );
    }

    spendedOnFirstBuy = coinsBuyQnt * realOrderPrice;
    startCounter = 1;
  }

  actualBoughtCoins = await getQntCoinsInPosition(coinName);

  return spendedOnFirstBuy;
};

async function main() {
  const currentTime = format(new Date(), "dd MMMM kk:mm:ss");

  const currentPrice = await getRates();

  if (zeroBuyCounter === 0) {

    coinsPrices = await buyPriceValues(+currentPrice, middleSplitter);
    coinsQuantity = await countStartCoinsValue(
      coinsPrices,
      stackSize,
      stackDevider
    );

    console.log('START TRADE INVOKE:', currentPrice, middleSplitter, coinsPrices, coinsQuantity);


    spentMoney[0] = await startTrade(
      coinsQuantity[0],
      "Start",
      currentPrice * fixingIncomeValue
    );
    spentMoney[0] = rounder(spentMoney[0], decimals); // Math.round(spentMoney[0] * 100000) / 100000;
    currentTier[0] = 1;
    zeroBuyCounter = 1;
    zakupka += 1;
    workedTiers[0] += 1;

    summSpentOnAllCoins = 0;
    quantityOfBoughtCoins = 0;
    binanceFeeOnBuy = 0;
    awaitedPriceOnSell = 0;
    averagePrice = 0;
    coinsQntMessage = coinsQuantity[0];
  }

  console.log(`======COIN ====> ${coinName} <=======COIN=======`);
  console.log("Цены усреднений:", coinsPrices);
  console.log("Будет куплено монет: ", coinsQuantity);

  spentMoney.forEach((summ, index) => {
    console.log(
      `${index} у., курс закупки: ${rounder(
        summ / coinsQuantity[index],
        decimals
      )}`
    );
  });

  console.log(`Потрачено на все монеты: $${spentMoney}`);
  console.log(`Курс сейчас: $${rounder(currentPrice, decimals)}`);

  summSpentOnAllCoins = spentMoney.reduce((acc, curr, index) => {
    return acc + curr * currentTier[index];
  });

  quantityOfBoughtCoins = coinsQuantity.reduce((acc, curr, index) => {
    return acc + curr * currentTier[index];
  });

  console.log("Всего куплено монет:", quantityOfBoughtCoins);
  console.log("Потрачено на монеты: $",rounder(summSpentOnAllCoins, 2));

  actualValueOfStack =
    currentPrice *
    coinsQuantity.reduce((acc, cur, index) => acc + cur * currentTier[index]);

  console.log(`Актуальная стоимость всех монет: $${rounder(actualValueOfStack, decimals)}`);

  averagePrice =
    spentMoney.reduce((acc, curr, index) => acc + curr * currentTier[index]) /
    coinsQuantity.reduce((acc, curr, index) => acc + curr * currentTier[index]);

  console.log("Средняя цена: $",rounder(+priceToSell, decimals));
  console.log("Торговый стек (накоп.):", stackValue)
  console.log("Всего закупок: ", zakupka, "\n");
  console.log("Уровни усреднение: ", workedTiers);
  console.log("Размер стека (по бирже):", actualBoughtCoins);

  console.log("ВРЕМЯ:", currentTime);

  if (sendMessageTrigger === 1) {
    let message = {
      operation: "Куплено",
      coin: coinName,
      qnt: coinsQntMessage,
      price: currentPrice,
      summ: spendedOnFirstBuy,
      tier,
      profitPrice: priceToSell,
    };
    sendBot(message);

    sendMessageTrigger = 0;
  }

  const ourWillingPrice = +priceToSell * fixingIncomeValue;
  console.log("ЦЕНА ДЛЯ ПРОДАЖИ:", rounder(ourWillingPrice,5));

  if (currentPrice >= ourWillingPrice) {
    // await orderBybit(+quantityOfBoughtCoins, coinName, "Sell"); //  ByBit Prod endpoint
    const preSellCheckQntCoins = await getQntCoinsInPosition(coinName);
    await orderBinance(preSellCheckQntCoins, coinName, "Sell"); // Binance Prod endpoint

    let message = {
      operation: "Продано",
      coin: coinName,
      qnt: quantityOfBoughtCoins,
      price: currentPrice,
      summ: quantityOfBoughtCoins * currentPrice,
      tier: "Продажа.",
      dirtyIncome: {
        sellOn: quantityOfBoughtCoins * currentPrice,
        boughtOn: summSpentOnAllCoins,
      },
    };

    sendBot(message);

    startCounter = 0;
    zeroBuyCounter = 0;

    spentMoney = spentMoney.map((spnt) => (spnt = 0));
    currentTier = currentTier.map((tier) => (tier = 0));
    coinsQuantity = coinsQuantity.map((qnt) => (qnt = 0));
    coinsPrices = coinsPrices.map((price) => (price = 0));

    awaitedPriceOnSell = 0;
    quantityOfBoughtCoins = 0;
    priceToSell = 0;

    sellCounter += 1;
    console.log("ТРИГГЕР ТАЙМЕРА:", sellCounter);
    timeFromLastSell = Date.now();

    sendMessageTrigger = 1;

    const totalPNL = await getBalance(coinName);
    stackValue = stackValue + +totalPNL / 2;

    tier = "Start";

    return;
  }

  if (currentPrice <= coinsPrices[1] && currentTier[1] == 0) {
    startCounter = 0;
    currentTier[1] = 1;
    spentMoney[1] = await startTrade(coinsQuantity[1]);
    spentMoney[1] = rounder(spentMoney[1], decimals)
    startCounter = 1;
    workedTiers[1] += 1;

    coinsQntMessage = coinsQuantity[1];
    sendMessageTrigger = 1;
    tier = "1 усреднение";

    return;
  }

  if (currentPrice <= coinsPrices[2] && currentTier[2] == 0) {
    startCounter = 0;
    currentTier[2] = 1;
    spentMoney[2] = await startTrade(coinsQuantity[2]);
    spentMoney[2] = rounder(spentMoney[1], decimals);
    startCounter = 1;
    workedTiers[2] += 1;

    coinsQntMessage = coinsQuantity[2];
    sendMessageTrigger = 1;
    tier = "2 усреднение";

    return;
  }

  if (currentPrice <= coinsPrices[3] && currentTier[3] == 0) {
    startCounter = 0;
    currentTier[3] = 1;
    spentMoney[3] = await startTrade(coinsQuantity[3]);
    spentMoney[3] = rounder(spentMoney[1], decimals);
    workedTiers[3] += 1;

    coinsQntMessage = coinsQuantity[3];

    sendMessageTrigger = 1;
    tier = "3 усреднение";

    return;
  }

  if (currentPrice <= coinsPrices[4] && currentTier[4] == 0) {
    startCounter = 0;
    currentTier[4] = 1;
    spentMoney[4] = await startTrade(coinsQuantity[4]);
    spentMoney[4] = rounder(spentMoney[1], decimals);
    startCounter = 1;
    workedTiers[4] += 1;

    coinsQntMessage = coinsQuantity[4];

    sendMessageTrigger = 1;
    tier = "4 усреднение";

    return;
  }

  if (currentPrice <= coinsPrices[5] && currentTier[5] == 0) {
    startCounter = 0;
    currentTier[5] = 1;
    spentMoney[5] = await startTrade(coinsQuantity[5]);
    spentMoney[5] = rounder(spentMoney[1], decimals);
    startCounter = 1;
    workedTiers[5] += 1;

    coinsQntMessage = coinsQuantity[5];

    sendMessageTrigger = 1;
    tier = "5 усреднение";

    return;
  }
}

const startBot = async () => {
  console.time("Time one cycle");
  await main();
  await timer();
  console.timeEnd("Time one cycle");
  startBot();
};

startBot();
