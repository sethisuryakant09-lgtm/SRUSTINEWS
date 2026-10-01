const { runCrawler } = require('./src/services/crawlerService');

runCrawler()
  .then(res => {
    console.log('SUCCESS:', res);
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
