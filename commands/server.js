module.exports = {
  name: 'server',
  description: 'Server!',
  execute(message, args) {
    message.channel.send(`
    \nServer name:  ${message.guild.name}
    Total members: ${message.guild.memberCount}
    Date Created: ${message.guild.createdAt} 
    Region: ${message.guild.region};
    `);
  },
};