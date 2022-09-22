const { checkPnlValue } = require('./utils/notifyOnProfit');
var CronJob = require('cron').CronJob;
var job = new CronJob(
  '*/5 * * * * *',
  checkPnlValue,
  null,
  true,
  'America/Los_Angeles'
);