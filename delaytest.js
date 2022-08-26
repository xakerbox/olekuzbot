const axios = require('axios');


const timer = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('')
    }, 2000)
  })
}

let t = 0;


const fun = async() => {
  const {data: result} = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ADAUSDT')
  console.log(result);
  console.log(t);
}


const main = async() => {
  console.time('Start');
  await fun();
  await timer();
  console.timeEnd('Start');
  main()
}

main();