const TelegramBot = require("node-telegram-bot-api");
const { getAllOpened } = require('./hashing')

const token = "5405704788:AAFFoHQJj_st8Lyo3ufi6Eo-bBulirLN3sA";
const chatIds = [165564370, 535043367]; // 535043367
const bot = new TelegramBot(token, { polling: false });

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   if (msg.text === 'all') {
//     bot.sendMessage(chatId, await getAllOpened())
//   }
// })

const sendBot = (message) => {
  let mes = message;

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

const notifyOnProtablePnl = (coins) => {
  try {
    const messages = coins.map(coin => {
      return `⚠️ Милорд, ${coin.coin} хочет порадовать!\nPNL достиг $${coin.pnl}\n`
    })
    chatIds.forEach(async (chatId) => {
      bot.sendMessage(chatId, ...messages);
    });
  } catch(e) {
    console.log('Милорд усрался', e)
  }

}

module.exports = { sendBot, sendErrorMessage, notifyOnProtablePnl };
