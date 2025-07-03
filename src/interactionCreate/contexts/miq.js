const { Client, Interaction, MessageActionRow, MessageButton } = require('discord.js');
const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const { MiQ } = require("makeitaquote");

module.exports = {
  name: "Make it a Quote",
  usage: "Make it a Quote",
  description: "引用画像を作成します",
  type: "Message",
  register: new ContextMenuCommandBuilder(),
  /**
   * @param {Client} client - Discord.js client
   * @param {Interaction} interaction - Discord.js interaction
   * @param {*} config - config
   * @returns none
   */
  async execute(client, interaction, config) {
    await interaction.reply("Loading...");

    const message = interaction.channel.messages.cache.get(interaction.options.getMessage("message").id);
    const content = message.cleanContent;

    const imageData = {
      text: content,
      avatar: message.member.displayAvatarURL({ size: 4096, format: "jpg" }) || message.author.displayAvatarURL({ size: 4096, format: "jpg" }),
      username: message.author.tag,
      display_name: message.member.displayName || message.author.displayName,
      color: false,
      watemark: client.user.tag
    };

    client.miq.set(message.id, imageData);

    const miq = new MiQ()
      .setFromObject(imageData, true);
    const responce = await miq.generateBeta();

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId(`miq-color-1-${message.id}`)
          .setLabel("Change to Color")
          .setStyle("PRIMARY")
      )

    await interaction.editReply({
      content: null,
      files: [{ attachment: responce, name: "quote.jpg" }],
      components: [row]
    });
  }
}
