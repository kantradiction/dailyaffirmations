/* Configure .ENV */
const dotenv = require('dotenv');
const result = dotenv.config()

if (result.error) {
 throw result.error
}

/* Dependencies */
const fs = require('fs');
const Discord = require('discord.js');
const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');
const schedule = require('node-schedule');
const express = require('express');
const http = require("http");
const app = express();


/* Setup Server */
let PORT = process.env.PORT || 3000
app.get('/', (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});

/* Discordjs Variables */
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands');

/*Scraped Website Config*/
const options = {
  uri: `https://www.aa.org/pages/en_US/daily-reflection`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}
const gratitude = process.env.GRATITUDE_SERVER_ID;

client.on('ready', () => {
  const gratitudeChnlID = process.env.GRATITUDE_CHANNEL_ID;
  const offTopicChnlId = process.env.OFF_TOPIC_CHANNEL_ID;
  const camelChnlId = process.env.CAMEL_CHANNEL_ID;
  const onAwakeningChnlId = process.env.ON_AWAKENING_CHANNEL_ID;

  console.log('Ready!');
  //send a message to the chat when online
  //client.channels.get(gratitudeChnlID).send(`Online`);
  //Scheduler
  const j = schedule.scheduleJob('0 6 * * *', () => {

    //Scrape Website
    rp(options)
      .then($ => {
        const day = $('.daily-reflection-day').text();
        const month = $('.daily-reflection-month').text();
        const headerTitle = $('.daily-reflection-header-title').text();
        const headerContent = $('.daily-reflection-header-content').text();
        const contentTitle = $('.daily-reflection-content-title').text();
        const content = $('.daily-reflection-content').text();

        //Send message to client
        client.channels.get(onAwakeningChnlId).send(`${month} ${day} - ${headerTitle}\n\n${headerContent}\n${contentTitle}\n\n${content}\n\nEnter !reflection anytime to get today's reflection.`);
      }).catch(error => {
        console.log(error);
      });
  });
});

client.on('message', message => {
  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

  const args = message.content.slice(process.env.PREFIX.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (!timestamps.has(message.author.id)) {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  } else {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(`${process.env.BOT_TOKEN}`);

// Starts our server
app.listen(PORT, function () {
  console.log("Server is listening on PORT: " + PORT);
});
//continually ping server to not let it sleep
setInterval(() => {
  http.get(`${process.env.PROJECT_URL}`);
  console.log("ping");
}, 7500000);