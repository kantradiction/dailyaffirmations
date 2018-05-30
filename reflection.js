const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');

module.exports = {
  name: 'reflection',
  description: 'Get today\'s reflection',
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

        //message.channel.send(`${month} ${day} - ${headerTitle}\n\n${headerContent}\n${contentTitle}\n\n${content}\n\nType !today to get today's reflection anytime`);
        message.author.send(`${month} ${day} - ${headerTitle}\n\n${headerContent}\n${contentTitle}\n\n${content}`)
          .then(() => {
            if (message.channel.type !== 'dm') {
              message.reply('I\'ve sent you a DM with today\'s reflection!');
            }
          })
          .catch(() => message.reply('Please enable DM\'s and try again'));;
      }).catch(error => {
        console.log(error);
      });
  },
};