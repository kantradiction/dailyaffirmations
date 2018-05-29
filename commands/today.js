const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');

module.exports = {
  name: 'today',
  description: 'Get today\'s affirmation',
  execute(message, args) {
    //Scraped Website Config
    const options = {
      uri: `https://www.aa.org/pages/en_US/daily-reflection`,
      transform: function (body) {
        return cheerio.load(body);
      }
    };

    //Scrape Website
    rp(options)
      .then($ => {
        const day = $('.daily-reflection-day').text();
        const month = $('.daily-reflection-month').text();
        const headerTitle = $('.daily-reflection-header-title').text();
        const headerContent = $('.daily-reflection-header-content').text();
        const contentTitle = $('.daily-reflection-content-title').text();
        const content = $('.daily-reflection-content').text();

        message.channel.send(`${month} ${day} - ${headerTitle}\n\n${headerContent}\n${contentTitle}\n\n${content}`);
      }).catch(error => {
        console.log(error);
      });
  },
};