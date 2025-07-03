const { Client, Interaction, MessageActionRow, MessageButton } = require("discord.js");
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
        const imageData = client.miq.get(messageId);
        imageData.color = isColor;

        const miq = new MiQ()
          .setFromObject(imageData, true);
        const responce = await miq.generateBeta();

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId(`miq-color-${isColor ? "0" : "1"}-${messageId}`)
              .setLabel(`Change to ${isColor ? "Grayscale" : "Color"}`)
              .setStyle("PRIMARY")
          )

        await interaction.update({
          content: null,
          files: [{ attachment: responce, name: "quote.jpg" }],
          components: [row]
        });
      }
    }
  }
};
