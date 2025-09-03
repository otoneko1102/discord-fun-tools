const { Client, Message } = require("discord.js");
const displus = require("displus");

/**
 * @param {Client} client - Discord.js client
 * @param {Message} message - Discord.js message
 * @param {*} config - config
 * @returns none
 */
module.exports = (client, message, config) => {
  if (message.author.bot) return;

    if (!message?.content) return;
    const content = displus.removeHiddenText(message.content);
    const regex = /(https:\/\/(?:x\.com|twitter\.com)\/\w+\/status\/\w+)/g;
    const urls = content?.match(regex) || [];

    if (urls?.length <= 0) return;

    const fixedContent = [];
    for (const url of urls) {
      const parseRegex = /(?:x\.com|twitter\.com)\/(\w+)\/status/;
      const username = url.match(parseRegex)[1];
      const fixedUrl = `https://fxtwitter.com/${username}/status/${url.split("/").pop()}`;
      const fixed = `[Tweet @${username}](${fixedUrl})`;
      fixedContent.push(fixed);
    }

    if (fixedContent.length > 0) {
      let isSent = false;
      try {
        message.channel.send({
          content: fixedContent.join("\n"),
          allowedMentions: {
            parse: [] // メンションを無効化
          }
        });
        isSent = true;
      } catch(e) {
        console.error(e);
      }

      setTimeout(() => {
        if (isSent) {
          try {
            const newMessage = message.channel.messages.cache?.get(message.id);
            if (newMessage) newMessage.suppressEmbeds(true);
          } catch (e) {
            console.error(e);
          }
        }
      }, 500);
    }
};
