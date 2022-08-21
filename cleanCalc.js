const getWorkingSum = (totalMoney, workingPercent) => {
  const workMoney = totalMoney * (workingPercent / 100);
  return workMoney;
};

const buyPriceValues = async (startBuyPrice, percentDecreasing) => {
  let pricesToBuy = [startBuyPrice.toFixed(6)];
  let newPrice = startBuyPrice;
  for (let i = 1; i <= 5; i++) {
    newPrice = startBuyPrice - startBuyPrice * (percentDecreasing[i - 1] / 100);
    pricesToBuy.push(Math.round(newPrice * 100000) / 100000);
  }

  return pricesToBuy; // возвращает стоимость при которой пора входить (уменьшается на percentDecreasing)
};

const countStartCoinsValue = async (
  pricesToBuy,
  totalMoney,
  workingPercent
) => {
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

  for (let i of plu) {
    coinsQuantity.push(parseInt(coins * i));
    totalCoins = totalCoins + coins * i;
    counter += 1;
  }

  return coinsQuantity;
};

module.exports = { buyPriceValues, countStartCoinsValue };