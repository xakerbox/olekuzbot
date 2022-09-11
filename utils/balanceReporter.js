const fs = require('fs');
const format = require('date-fns/format')

const getDailyBalance = () => {
  const rawData = fs.readFileSync('./balanceHistory.csv', 'utf-8');
  const array = rawData.split('\n').slice(0, -1);

  const mappedBalances = array.map(el => {
    return {
      date: el.split(',')[0].split(' ')[0],
      time: el.split(',')[0].split(' ')[1],
      balance: el.split(',')[1],
    }
  })

  const dateNow = format(new Date(), 'dd.MM');
  const [{ balance: midnightBalance }] = mappedBalances.filter(el => el.date === dateNow && el.time === '00:00:00');
  const [{ balance: lastBalance }] = mappedBalances.slice(-1);
  const dailyProfit = lastBalance - midnightBalance;
  return Math.round(dailyProfit * 100) / 100;
}

module.exports = { getDailyBalance };