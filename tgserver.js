const TelegramBot = require("node-telegram-bot-api");
const { getAllOpened, getWalletBalance } = require("./hashing");
const { dreamCalc } = require("./dreamCalc");
const { getDailyBalance } = require("./utils/balanceReporter")

const token = "5405704788:AAFFoHQJj_st8Lyo3ufi6Eo-bBulirLN3sA";
const chatIds = [165564370, 535043367]; // 535043367
const bot = new TelegramBot(token, { polling: true });

let constant = 0;

bot.setMyCommands([{
  command: '/start', description: 'Я сказала стартуем!'
},
])

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Чё надо?", {
    reply_markup: {
      keyboard: [["🏦 BALANCE 🏦"], ["🪙 COINS 🪙"], ["🤌 CALC 🤌"], ["⏰ PROFIT ЗА СЕГОДНЯ ⏰"]],
    },
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
});


bot.on("message", async (msg) => {

  if (msg.text === "🪙 COINS 🪙") {
    await bot.sendMessage(msg.chat.id, await getAllOpened(), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  }

  if (msg.text === "🏦 BALANCE 🏦") {
    await bot.sendMessage(msg.chat.id, await getWalletBalance());
  }

  if (msg.text === 'ВЫЙТИ') {
    constant = 0;
    await bot.sendMessage(msg.chat.id, 'Выходим...', {
      reply_markup: {
        keyboard: [["🏦 BALANCE 🏦"], ["🪙 COINS 🪙"], ["🤌 CALC 🤌"], ['⏰ PROFIT ЗА СЕГОДНЯ ⏰']],
      }
    })
    return
  }

  if (constant === 1) {
    const data = msg.text.trim().split(',');
    await bot.sendMessage(msg.chat.id, `Миллионером будешь через ${dreamCalc(+data[0], +data[1], +data[2])} дней(я)!`);
    constant = 0;
    return
  }

  if (msg.text === "🤌 CALC 🤌") {
    await bot.sendMessage(
      msg.chat.id,
      "Введи данные через запятую в формате: \n СТАРТ_ДЕПО, ЖЕЛАЕМЫЙ_ДЕПО, СУТОЧНЫЙ ПРОЦЕНТ\n\nПример:\n1000, 1000, 0.5\n", {
      reply_markup: {
        keyboard: [["ВЫЙТИ"]],
      }
    })

    constant = 1;
    return
  }

  if (msg.text === '⏰ PROFIT ЗА СЕГОДНЯ ⏰') {
    await bot.sendMessage(msg.chat.id, `За сегодня боты принесли: ${getDailyBalance()}`)
  }
});