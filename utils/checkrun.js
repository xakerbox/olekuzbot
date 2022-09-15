const { exec } = require("child_process");

const checkRunBot = async (coinName) => {
  let result;
  exec(`ps aux | grep ${coinName}_bot | grep node`, (error, stdout, stderr) => {
    if (stdout) {
      result = true;
      return;
    }
    return false;
  });

  console.log(result);
};

module.exports = { checkRunBot };
