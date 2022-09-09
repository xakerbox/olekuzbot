const dreamCalc = (startDepo, finalGoal, dayProfit) => {
  let i = 1;
  while (startDepo <= finalGoal) {
    startDepo = startDepo + startDepo * (dayProfit / 100);
    i++;
  }
  return i;
};

module.exports = { dreamCalc };
