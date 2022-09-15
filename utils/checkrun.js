const { exec } = require("child_process");

const checkRunBot = async (coinName) => {
  let result;
  exec(`ps aux | grep ${coinName}_bot | grep node`, (error, stdout, stderr) => {
    if (stdout) {
      console.log(result);

      result = true;
      return;
    }
    return false;
  });

};

module.exports = { checkRunBot };
