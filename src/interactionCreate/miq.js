const { Client, Interaction } = require("discord.js");
const { MiQ } = require("makeitaquote");
const customIdToArgs = require("../../lib/src/customIdToArgs");

/**
 * @param {Client} client - Discord.js client
 * @param {Interaction} interaction - Discord.js message
 * @param {*} config - config
 * @returns none
 */
module.exports = async (client, interaction, config) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("miq")) {
      const args = customIdToArgs(interaction.customId);

      // color
      if (args[0] === "color") {
        const isColor = parseInt(args[1]) == 1;
        const messageId = args[2];
        let imageData = client.miq?.get(messageId);
        if (!imageData) {
          const message = await interaction.channel.messages?.fetch(messageId);
          if (message) {
            const content = message.cleanContent;
            imageData = {
              text: content,
              avatar: message.member?.displayAvatarURL({ size: 4096, format: "jpg" }) || message.author?.displayAvatarURL({ size: 4096, format: "jpg" }),
              username: message.author?.tag,
              display_name: message.member.displayName || message.author.displayName,
              color: isColor,
              watemark: client.user.tag
            }
            client.miq.set(messageId, imageData);
          } else {
            return interaction.reply({
              content: "MiQデータが見つかりませんでした",
              ephemeral: true
            });
          }
        }
        imageData.color = isColor;

        const miq = new MiQ()
          .setFromObject(imageData, true);
        const responce = await miq.generateBeta();

        const row = interaction.message.components[0];
        row.components[0].customId = `miq-color-${isColor ? "0" : "1"}-${messageId}`;
        row.components[0].label = `Change to ${isColor ? "Grayscale" : "Color"}`;

        await interaction.update({
          content: null,
          files: [{ attachment: responce, name: "quote.jpg" }],
          components: [row]
        });
      }

      // remove
      if (args[0] === "remove") {
        await interaction.update({
          content: `Removed by **${interaction.user.tag}**`,
          files: [],
          components: []
        });
      }
    }
  }
};
