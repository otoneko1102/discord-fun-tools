const { removes, isOnlyKanji, containsSticker, setChannelSlowmode } = require("../../lib/tuita");
const { Client, Message, MessageEmbed } = require("discord.js");

/**
 * @param {Client} client - Discord.js client
 * @param {Message} message - Discord.js message
 * @param {*} config - config
 * @returns none
 */
module.exports = async (client, message, config) => {
  if (message.channel?.name?.includes("対多")) {
    if (message.author.bot || message.author.id === client.user.id) return;
    if (message.embeds?.length > 0 || message?.interactionData?.type == 1) return message.delete();
    const r = isOnlyKanji(message.content) && !containsSticker(message);
    if (!message.content) {
      try { message.delete().catch(e => e.message) } catch {};
      const msg = await message.channel.send(`${message.author}\n警告。唯一偽中国語仕様可能`);
      setTimeout(() => {
        try { msg.delete().catch(e => console.error(e.message)) } catch {}
      }, 3000);
      return;
    }
    const embed = new MessageEmbed()
      .setAuthor({ name: message.author.tag, iconURL: message.member.displayAvatarURL() })
      .setDescription(message.content ?? 'none')
      .setFooter({ text: `${r}` })
      .setTimestamp()
    const ch = message.guild.channels.cache.get(config.channels.tuita);
    if (ch) ch.send({ embeds: [embed] });

    if (!r) {
      try {message.delete().catch(e => e.message) } catch {};
      const msg = await message.channel.send(`${message.author}\n警告。唯一偽中国語仕様可能`);
      setTimeout(() => {
        try { msg.delete().catch(e => console.error(e.message)) } catch {}
      }, 3000);
      return;
    }

    const emojis = ["🌱", "👍", "🍬"];
    emojis.forEach(emoji => {
      message.react(emoji);
    });

    setChannelSlowmode(message);
  }
};
