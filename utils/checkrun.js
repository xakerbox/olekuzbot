const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getRunnedOrNot = async (coin) => {
  const { stdout } = await exec("ps aux");
  const runOrNot = stdout
    .split("\n")
    .filter((el) => el.includes(`node ${coin.symbol}_bot`));

  const status = runOrNot.length ? "🟢" : "🔴";
  return status;
};

module.exports = { getRunnedOrNot };
