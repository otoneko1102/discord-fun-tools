const { Client, GuildMember } = require("discord.js");

/**
 * 
 * @param {Client} client - Discord.jsclient
 * @param {GuildMember} member - Discord.js guild member
 * @param {*} config - config
 */
module.exports = (client, member, config) => {
  if (member.guild.id === config.guild) {
    const channel = member.guild.systemChannel;
    console.log(channel);
    if (channel) channel.send(`${member}\n参加ありがとうございます！\n<#${config.channels.introduction}> で自己紹介文を送信すると全チャンネルが閲覧可能になります！`)
  }
}