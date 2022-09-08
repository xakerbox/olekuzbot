const TelegramBot = require("node-telegram-bot-api");

const token = "5405704788:AAFFoHQJj_st8Lyo3ufi6Eo-bBulirLN3sA";
const chatIds = [165564370, 535043367]; // 535043367
const bot = new TelegramBot(token, { polling: false });

// const message = {
//   operation: "Куплено",
//   coin: "OP",
//   qnt: 23,
//   price: 34,
//   summ: 435,
//   tier: 'Start',
//   averagePrice: 1.5,
//   dirtyIncome: 43,
// };

const sendBot = (message) => {
  let mes = message;

  // let message = {
  //   operation: "Продано",
  //   coin: coinName,
  //   qnt: origQty,
  //   price: avgPrice,
  //   summ: cumQuote,
  //   tier: "Продажа.",
  //   dirtyIncome: {
  //     sellOn: rounder(totalPNL, 3),
  //     boughtOn: summSpentOnAllCoins,
  //   },
  // };

  const tier = mes.tier === "Start" ? "🟢 Закупка" : `${mes.tier}`;
  chatIds.forEach(async (chatId) => {
    let dirtyIncome = mes.dirtyIncome ? mes.dirtyIncome : "";
    let incomeRow = dirtyIncome
      ? `💰💰 $${
        dirtyIncome.sellOn
        } 💰💰`
      : "";

    bot.sendMessage(
      chatId,
      `
${tier} | ${mes.qnt} ${mes.coin.slice(0, -4)}
${incomeRow}
      `
    );
  });
};

const sendErrorMessage = (error) => {
  let mes = error;

  chatIds.forEach(async (chatId) => {
    bot.sendMessage(chatId, `🚨 ${mes.coin} вышел из чата. ${mes.error}\n`);
  });
};

module.exports = { sendBot, sendErrorMessage };
