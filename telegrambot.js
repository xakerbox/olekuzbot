const TelegramBot = require("node-telegram-bot-api");

const token = "5405704788:AAFFoHQJj_st8Lyo3ufi6Eo-bBulirLN3sA";
const chatIds = [165564370, 535043367];
const bot = new TelegramBot(token, { polling: false });

// const message = {
//   operation: "Куплено",
//   coin: "OP",
//   qnt: 23,
//   price: 34,
//   summ: 435
//   tier: 'Start'
// };

const sendBot = (message) => {
  let mes = message;

  const tier = mes.tier === 'Start' ? 'Закупка.' : `${mes.tier}`;
  chatIds.forEach(async (chatId) => {
    bot.sendMessage(
      chatId,
      `
--------------------
${tier}
${mes.operation} ${mes.qnt} ${mes.coin} по цене $${mes.price} на $${mes.summ.toFixed(2)}
--------------------
      `
    );
  });
};

module.exports = { sendBot };