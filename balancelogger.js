const { getCurrentBalance } = require('./hashing');
var CronJob = require('cron').CronJob;
var job = new CronJob(
  '*/10 * * * *',
  getCurrentBalance,
  null,
  true,
  'America/Los_Angeles'
);