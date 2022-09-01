const axios = require("axios");

let attempts = 0;
let res;


const getResponse = async (param) => {
  if (param === 1) {
    try {
      const { data: result } = await axios.get(
        "https://api.privatbank.ua/p24api1/pubinfo?json&exchange&coursid=5"
      );
    res = result;

    } catch (e) {
      if (attempts < 2) {
        getResponse();
        attempts += 1;
      } else {
        throw e;
      }
    }
  }

  if (param === 0) {
    return 'Nothing interesting.'
  }

  res ? console.log(res) : '';
};

getResponse(1).then(res => console.log(res))