const { notifyAtProfitpened } = require("../hashing");
const { notifyOnProtablePnl } = require("../telegrambot");
const checkPnlValue = async () => {
  try {
    const result = await notifyAtProfitpened();
    console.log(result);
    const filteredCoins = result.filter(coin => coin.status === "🔴" && coin.pnl > 0);
    if (filteredCoins.length) {
      notifyOnProtablePnl(filteredCoins);
    }
  } catch(e) {
    console.log('Error in notifyOnProfit module', e)
  }

};

module.exports = { checkPnlValue };
