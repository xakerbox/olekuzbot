const TelegramBot = require("node-telegram-bot-api");
const { getAllOpened, getWalletBalance } = require('./hashing')

const token = "5405704788:AAFFoHQJj_st8Lyo3ufi6Eo-bBulirLN3sA";
const chatIds = [165564370, 535043367]; // 535043367
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text === '🪙 COINS 🪙' || msg.text === 'All') {
    bot.sendMessage(chatId, await getAllOpened())
  }
  
  if (msg.text === '🏦 BALANCE 🏦') {
    bot.sendMessage(chatId, await getWalletBalance())
  }
})

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id, 'Чё надо?', {
  "reply_markup": {
      "keyboard": [['🏦 BALANCE 🏦'], ['🪙 COINS 🪙']]
      }
  });
  
});