const { Client } = require("discord.js");

/**
 * @param {Client} client - Discord.js client
 * @param {*} config - config
 * @returns none
 */
module.exports = (client, config) => {
  client.user.setStatus(config.status.type);

  const messages = config.status.messages;
  let i = 0;
  setInterval(() => {
    try {
      client.user.setActivity({
        name: messages[i],
        type: "CUSTOM"
      });
      i = (i + 1) % messages.length;
    } catch {}
  }, 15 * 1000);
};
