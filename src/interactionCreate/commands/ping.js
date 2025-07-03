const { Client, Interaction, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const disk = osu.drive;

module.exports = {
  name: "ping",
  usage: "ping",
  description: "Pong!",
  register: new SlashCommandBuilder(),
  /**
   * @param {Client} client - Discord.js client
   * @param {Interaction} interaction - Discord.js interaction
   * @param {*} config - config
   * @returns none
   */
  async execute(client, interaction, config) {
    interaction.reply("Loading...");
    const sent = await interaction.fetchReply();

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
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

    interaction.editReply({ content: null, embeds: [embed] });
  }
}
