const rounder = (value, decimals) => {
  let round = 1;

  switch (decimals) {
    case 1:
      round = 10;
      break;
    case 2:
      round = 100;
      break;
    case 3:
      round = 1000;
      break;
    case 4:
      round = 10000;
      break;
    case 5:
      round = 100000;
      break;
    case 6:
      round = 1000000;
      break;
  }

  console.log(round);

  const result = Math.round(value * round) / round;
  return result;
};

module.exports = { rounder };
