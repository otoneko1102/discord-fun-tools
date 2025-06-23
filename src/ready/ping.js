const { Client, MessageEmbed } = require('discord.js');
const os = require("os");
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const disk = osu.drive;

/**
 * @param {Client} client - Discord.js client
 * @param {*} config - config
 * @returns none
 */
module.exports = async (client, config) => {
  setInterval(() => {
    checkPing();
  }, 10 * 60 * 1000);
  checkPing();

  async function checkPing() {
    const channel = await client.channels.fetch(config.channels.ping).catch(() => null);
    if (!channel) return;

    const sent = await channel.send("Loading...");

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
        { name: "WebSocket Ping", value: `\`${wsPing}ms\``, inline: true },
        { name: "メモリ使用率", value: `\`${memInfo.usedMemMb}MB / ${memInfo.totalMemMb}MB (${memInfo.usedMemPercentage}%)\``, inline: false },
        { name: "ディスク使用率", value: `\`${diskInfo.usedGb}GB / ${diskInfo.totalGb}GB (${diskInfo.usedPercentage}%)\``, inline: false },
        { name: "CPU使用率", value: `\`${cpuUsage.toFixed(1)}%\``, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `実行環境: ${os.hostname()}` });

    sent.edit({ content: null, embeds: [embed] });
  }
};
