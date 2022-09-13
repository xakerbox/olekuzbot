const fs = require("fs");
const format = require("date-fns/format");

const getDailyBalance = async () => {
  const rawData = fs.readFileSync("./balanceHistory.csv", "utf-8");
  const array = rawData.split("\n").slice(0, -1);

  const mappedBalances = await Promise.all([
    array.map((el) => {
      return {
        date: el.split(",")[0].split(" ")[0],
        time: el.split(",")[0].split(" ")[1],
        balance: el.split(",")[1],
      };
    }),
  ]);

  const dateNow = format(new Date(), "dd.MM");
  const midnightBalance = mappedBalances[0].filter(
    (el) =>
      (el.date === dateNow && el.time === "00:00:00") ||
      el.time === "00:00:01" ||
      el.time === "00:00:02"
  );
  const lastBalance = mappedBalances.slice(-1);
  const [{ balance: nightB }] = midnightBalance;
  const [{ balance: lastB }] = lastBalance[0].slice(-1);
  console.log("last", lastBalance[0].slice(-1));
  const dailyProfit = lastB - nightB;
  return Math.round(dailyProfit * 100) / 100;
};

module.exports = { getDailyBalance };
