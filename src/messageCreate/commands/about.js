const { Client, Message, MessageEmbed } = require("discord.js");

const path = require("path");
const fs = require("fs-extra");

module.exports = {
  name: "about",
  usage: "about",
  aliases: ["info"],
  description: "BOTの情報を表示します",
  /**
   * @param {Client} client - Discord.js client
   * @param {Message} message - Discord.js message
   * @param {string[]} args - args
   * @param {*} config - config
   * @returns none
   */
  async execute(client, message, args, config) {
    const packagePath = path.join(__dirname, "../../../package.json");
    const packageData = fs.readJsonSync(packagePath);
    const names = Object.keys(packageData.dependencies);
    const packages = names.map(p => `${p}: ${packageData.dependencies[p]}`);

    const embed = new MessageEmbed()
      .setTitle(client.user.tag)
      .setDescription(`使用パッケージ\n${packages.join("\n")}`)
      .setColor(config.color);

    message.reply({ embeds: [embed] });
  }
}
