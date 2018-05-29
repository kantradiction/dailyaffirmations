module.exports = {
  name: 'role',
  description: 'Role!',
  args: true,
  usage: '<user> <role>',
  execute(message, args) {
      message.channel.send('Pong.');
  },
};