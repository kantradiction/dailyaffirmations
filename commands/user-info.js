module.exports = {
  name: 'user-info',
  description: 'User-Info!',
  execute(message, args) {
    message.channel.send(`Your username: ${message.author.username}
    Your ID: ${message.author.id}`);
  },
};