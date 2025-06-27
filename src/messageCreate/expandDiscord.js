const { Client, Message, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const displus = require("displus");

/**
 * @param {Client} client - Discord.js client
 * @param {Message} message - Discord.js message
 * @param {*} config - config
 * @returns none
 */
module.exports = async (client, message, config) => {
  if (message.author.bot) return;
  const content = displus.removeHiddenText(message.content);
  const regex = /https?:\/\/(?:www\.)?discord(?:app)?\.com\/channels\/(\d{17,19})\/(\d{17,19})\/(\d{17,19})/g;
  const matches = content.matchAll(regex);

  for (const match of matches) {
    const [fullMatch, guildId, channelId, messageId] = match;

    try {
      const guild = client.guilds.cache.get(guildId);
      const channel = client?.channels?.cache.get(channelId) || null;
      if (channel && !message.channel?.nsfw && channel?.nsfw) return; // NSFWチャンネルからの引用を防ぐ
      let linkedMessage = {};

      try {
        linkedMessage = await channel.messages.fetch(messageId);
      } catch {
        continue;
      }

      const embeds = [
        {
          author: {
            name: `${linkedMessage.author.tag} (ID: ${linkedMessage.author.id})`,
            icon_url: linkedMessage.member?.displayAvatarURL()
          },
          description: linkedMessage?.content,
          color: config.color,
          footer: {
            text: `${guild.name} | ${channel.name}`,
            icon_url: guild.iconURL()
          },
          timestamp: new Date(linkedMessage.createdTimestamp).toISOString()
        }
      ];

      const attachments = linkedMessage.attachments.size > 0 ? linkedMessage.attachments.map(a => a.proxyURL) : undefined;

      if (attachments) attachments.forEach((a, i) => {
        if (!embeds[i]) {
          embeds.push({
            image: {
              url: a
            },
            color: config.color
          });
        } else {
          embeds[i].image = { url: a };
        }
      });

      let messageUrl = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
      message.reply({
        content: `[Original Message](<${messageUrl}>)`,
        embeds
      });
    } catch (e) {
      console.error(e);
    }
  }
};
