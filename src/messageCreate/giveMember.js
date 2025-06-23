const { Client, Message } = require("discord.js");

/**
 * @param {Client} client - Discord.js client
 * @param {Message} message - Discord.js message
 * @param {*} config - config
 * @returns none
 */
module.exports = (client, message, config) => {
  if (!message.author.bot && message.channel.id === config.channels.introduction) {
    if (message.member.roles.cache.has(config.roles.member)) return;
    message.member.roles.add(config.roles.member);
    message.react(config.emojis.check);
  }
};
