const TelegramBot = require("node-telegram-bot-api");
const { getAllOpened, getWalletBalance } = require("./hashing");
const { dreamCalc } = require("./dreamCalc");

const token = "5405704788:AAFFoHQJj_st8Lyo3ufi6Eo-bBulirLN3sA";
const chatIds = [165564370, 535043367]; // 535043367
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text === "🪙 COINS 🪙" || msg.text === "All") {
    bot.sendMessage(chatId, await getAllOpened());
  }

  if (msg.text === "🏦 BALANCE 🏦") {
    bot.sendMessage(chatId, await getWalletBalance());
  }
});

bot.onText(/\/start/, (msg, ) => {
  bot.sendMessage(msg.chat.id, "Чё надо?", {
    reply_markup: {
      keyboard: [["🏦 BALANCE 🏦"], ["🪙 COINS 🪙"], ["CALC"]],
    },
  });
});

// bot.onText("CALC", (msg, match) => {
//   bot.sendMessage(
//     msg.chat.id,
//     "Введи данные через запятую в формате: \n СТАРТ_ДЕПО, ЖЕЛАЕМЫЙ_ДЕПО, СУТОЧНЫЙ ПРОЦЕНТ\n\nПример:\n1000, 1000, 0.5"
//   );
// });
