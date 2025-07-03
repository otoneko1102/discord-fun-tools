require("dotenv").config();

const { Client, Message } = require('discord.js');
const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandType } = require("discord-api-types/v10");
const fs = require("fs-extra");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);


const os = require("os");
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const disk = osu.drive;

module.exports = {
  name: "register",
  usage: "register",
  aliases: ["reload"],
  description: "スラッシュコマンドを登録・更新します",
  /**
   * @param {Client} client - Discord.js client
   * @param {Message} message - Discord.js message
   * @param {string[]} args - args
   * @param {*} config - config
   * @returns none
   */
  async execute(client, message, args, config) {
    const sent = await message.reply("Loading...");

    const commands = [];
    // Slash commands
    for (const s of [...client.slashes?.values()]) {
      if (!s.register) continue;
      const command = s.register.setName(s.name).setDescription(s.description).toJSON();
      commands.push(command);
    }
    // Context commands
    for (const s of [...client.contexts?.values()]) {
      if (!s.register) continue;
      const command = s.register.setName(s.name).setType(ApplicationCommandType[s.type]).toJSON();
      commands.push(command);
    }
    // Others
    for (const s of client.interactionCreate) {
      if (!s.register) continue;
      const command = s.register.setName(s.name).setDescription(s.description).toJSON();
      commands.push(command);
    }

    // 登録
    regist(commands)
      .catch(e => {
        sent.edit("エラーが発生しました");
        console.error(e);
      })
      .then(() => {
        sent.edit("登録しました")
      });
  }
}

async function regist(commands) {
  await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_ID), {
    body: commands
  });
}
