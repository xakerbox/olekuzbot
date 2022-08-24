const getWorkingSum = (totalMoney, workingPercent) => {
  const workMoney = totalMoney * (workingPercent / 100);
  console.log("Рабочий депозит одного стека: $", workMoney);
  return workMoney;
};

const buyPriceValues = (startBuyPrice, percentDecreasing) => {
  let pricesToBuy = [startBuyPrice.toFixed(6)];
  let newPrice = startBuyPrice;
  for (let i = 1; i <= 5; i++) {
    newPrice = startBuyPrice - startBuyPrice * (percentDecreasing[i -1] / 100);
    pricesToBuy.push(newPrice.toFixed(6));
  }

  return pricesToBuy; // возвращает стоимость при которой пора входить (уменьшается на percentDecreasing)
};

const countStartCoinsValue = (pricesToBuy, totalMoney, workingPercent) => {
  const plu = [1.5, 2.25, 3.375, 5.0625, 7.59375];

  const workingMoney = getWorkingSum(totalMoney, workingPercent);
  const coins =
    workingMoney /
    (parseFloat(pricesToBuy[0]) +
      parseFloat(pricesToBuy[1]) * plu[0] +
      parseFloat(pricesToBuy[2]) * plu[1] +
      parseFloat(pricesToBuy[3]) * plu[2] +
      parseFloat(pricesToBuy[4]) * plu[3] +
      parseFloat(pricesToBuy[5]) * plu[4]);

  let totalCoins = coins;
  let counter = 1;

  let coinsQuantity = [parseInt(coins)];


  let result = [
    {
      круг: "закупка",
      "кол-во монет": parseInt(coins),
      "цена покупки": parseFloat(pricesToBuy),
    },
  ];
  for (let i of plu) {
    // console.log(`${counter} круг ==> купить монет ${coins * i} по цене ${pricesToBuy[counter]}`);
    coinsQuantity.push(parseInt(coins * i))

    result.push({
      круг: counter,
      "кол-во монет": parseInt(coins * i),
      "цена покупки": parseFloat(pricesToBuy[counter]),
    });
    totalCoins = totalCoins + coins * i;
    counter += 1;
  }

  console.log(`Почем покупать: ${pricesToBuy.map((el) => " $" + el + "")}`);
  console.log("Всего монет будет куплено за 5 кругов: ", totalCoins); // Количество монет суммарное
  console.log("Средняя цена: ", workingMoney / totalCoins); // Средняя цена
  console.table(result);

  return coinsQuantity;
};

const getWorkingStacks = (totalMoney, stackQnt, workingPart) => {
  const everyStackValue = (0.5 * totalMoney) / stackQnt;
  console.log(`Депозит будет разделён на:
  -- страхововой = $${totalMoney * 0.5}
  -- рабочий = $${totalMoney * 0.5}
  
  Разделение на ${stackQnt} стеков по $${everyStackValue}.
  Каждый из них будет делиться на:
  -- рабочую сумму: $${everyStackValue * (workingPart / 100)}
  -- страховую сумму: $${everyStackValue * ((100 - workingPart) / 100)}
  --------------------------
  `);
  return everyStackValue;
};



const main = (
  startPrice,
  percentDecreasing,
  totalMoney,
  workingPercent,
  stackQnt
) => {
  countStartCoinsValue(
    buyPriceValues(startPrice, percentDecreasing),
    getWorkingStacks(totalMoney, stackQnt, workingPart),
    workingPercent
  );


};

/////////////
/////////////
/////////////
/////////////
/////////////
/////////////
/////////////

// МЕНЯЕШЬ ЗНАЧЕНИЯ У ЭТИХ ПЯТИ ПЕРЕМЕННЫХ:

const currentPrice = 0.21884; // стартовая стоимость монеты в у.е.(например: 0.54, 2.34)
const percentDecr = [0.5, 1.1, 2.5, 4, 10]; //процент снижения цены (например: 2%, 1.5% (знак процента не пишем))
const totalSum = 67 * 10; // общая сумма (всего денег) (она будет делиться 50/50 и на кол-во стеков)
const stackQnt = 1; // кол-во стеков для первоначальной суммы
const workingPart = 30; // размер рабочей доли (например: 10/90 => вводим 10, 30/70, вводим 30)

// const pricesToBuy = buyPriceValues(startPrice=0.72, percentDecreasing=1);
// const coinsQNT = countStartCoinsValue(pricesToBuy, 1000, 30)
// console.log('COUNTED PRICES TO BUY: ', pricesToBuy);
// console.log('COINS QUANTITY: ', coinsQNT);

/////////////
/////////////
/////////////
/////////////
/////////////
/////////////
// Функцию НЭ трогай:)
main(currentPrice, percentDecr, totalSum, workingPart, stackQnt);

