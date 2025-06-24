const { removes, isOnlyKanji, containsSticker, setChannelSlowmode } = require("../../lib/src/tuita");
const { Client, Message, PartialMessage, MessageEmbed } = require("discord.js");

/**
 * @param {Client} client - Discord.js client
 * @param {Message | PartialMessage} oldMessage - Discord.js oldMessage
 * @param {Message | PartialMessage} newMessage - Discord.js newMessage
 * @param {*} config - config
 * @returns none
 */
module.exports = async (client, oldMessage, newMessage, config) => {
  if (newMessage.channel?.name?.includes('対多')) {
    if (newMessage.author.bot || newMessage.author.id === client.user.id) return;
    if (newMessage.embeds?.length > 0 || newMessage?.interactionData?.type == 1) return newMessage.delete();
    const r = isOnlyKanji(newMessage.content) && !containsSticker(newMessage)
    if (!newMessage.content) {
      try {newMessage.delete().catch(e => e.message) } catch {};
      const msg = await newMessage.channel.send(`${newMessage.author}\n警告。唯一偽中国語仕様可能`);
      setTimeout(() => {
        try { msg.delete().catch(e => console.error(e.message)) } catch {}
      }, 3000);
      return;
    }
    const embed = new MessageEmbed()
      .setAuthor({ name: newMessage.author.tag, iconURL: newMessage.member.displayAvatarURL() })
      .setDescription(newMessage.content ?? 'none')
      .setFooter({ text: `${r}` })
      .setTimestamp()
    const ch = newMessage.guild.channels.cache.get(config.channels.tuita);
    ch.send({ embeds: [embed] });
    if (!r) {
      try {newMessage.delete().catch(e => e.message) } catch {};
      const msg = await newMessage.channel.send(`${newMessage.author}\n警告。唯一偽中国語使用可能`);
      setTimeout(() => {
        try { msg.delete().catch(e => console.error(e.message)) } catch {}
      }, 3000);
      return;
    }
    setChannelSlowmode(newMessage);
  }
};
