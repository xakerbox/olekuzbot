const TelegramBot = require("node-telegram-bot-api");
const { getAllOpened, getWalletBalance } = require("./hashing");
const { dreamCalc } = require("./dreamCalc");

const token = "5405704788:AAFFoHQJj_st8Lyo3ufi6Eo-bBulirLN3sA";
const chatIds = [165564370, 535043367]; // 535043367
const bot = new TelegramBot(token, { polling: true });

let constant = 0;

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Чё надо?", {
    reply_markup: {
      keyboard: [["🏦 BALANCE 🏦"], ["🪙 COINS 🪙"], ["CALC"]],
    },
  });


  bot.on("message", async (msg) => {

    if (msg.text === "🪙 COINS 🪙") {
      bot.sendMessage(chatId, await getAllOpened());
    }

    if (msg.text === "🏦 BALANCE 🏦") {
      bot.sendMessage(chatId, await getWalletBalance());
    }

    if (msg.text === "CALC") {
      await bot.sendMessage(
        chatId,
        "Введи данные через запятую в формате: \n СТАРТ_ДЕПО, ЖЕЛАЕМЫЙ_ДЕПО, СУТОЧНЫЙ ПРОЦЕНТ\n\nПример:\n1000, 1000, 0.5\n", {
        reply_markup: {
          keyboard: [["ВЫЙТИ"]],
        }
      })

      constant = 1;
      return
    }

    if (msg.text === 'ВЫЙТИ') {
      bot.sendMessage(chatId, 'Выходим...', {
        reply_markup: {
          keyboard: [["🏦 BALANCE 🏦"], ["🪙 COINS 🪙"], ["CALC"]],
        }
      })
    }


    if (constant === 1) {
      const data = msg.text.trim().split(',');
      bot.sendMessage(chatId, `Миллионером будешь через ${dreamCalc(+data[0], +data[1], +data[2])} дней(я)!`);
      constant = 0;
      return
    }
  });

});
