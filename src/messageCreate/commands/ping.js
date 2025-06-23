const { Client, Message, MessageEmbed } = require('discord.js');
const os = require("os");
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const disk = osu.drive;

module.exports = {
  name: "ping",
  usage: "ping",
  aliases: ["p"],
  description: "Pong!",
  /**
   * @param {Client} client - Discord.js client
   * @param {Message} message - Discord.js message
   * @param {string[]} args - args
   * @param {*} config - config
   * @returns none
   */
  async execute(client, message, args, config) {
    const sent = await message.reply("Loading...");

    const latency = sent.createdTimestamp - message.createdTimestamp;
    const wsPing = client.ws.ping;

    const [cpuUsage, memInfo, diskInfo] = await Promise.all([
      cpu.usage(),
      mem.info(),
      disk.info()
    ]);

    const embed = new MessageEmbed()
      .setColor(config.color)
      .setTitle("Pong!")
      .addFields(
        { name: "メッセージ遅延", value: `\`${latency}ms\``, inline: true },
        { name: "WebSocket Ping", value: `\`${wsPing}ms\``, inline: true },
        { name: "メモリ使用率", value: `\`${memInfo.usedMemMb}MB / ${memInfo.totalMemMb}MB (${memInfo.usedMemPercentage}%)\``, inline: false },
        { name: "ディスク使用率", value: `\`${diskInfo.usedGb}GB / ${diskInfo.totalGb}GB (${diskInfo.usedPercentage}%)\``, inline: false },
        { name: "CPU使用率", value: `\`${cpuUsage.toFixed(1)}%\``, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `実行環境: ${os.hostname()}` });

    sent.edit({ content: null, embeds: [embed] });
  }
}
