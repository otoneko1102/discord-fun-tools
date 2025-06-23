const { Client, Message, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  name: "help",
  usage: "help",
  aliases: ["h"],
  description: "ヘルプを表示します",
  /**
   * @param {Client} client - Discord.js client
   * @param {Message} message - Discord.js message
   * @param {string[]} args - args
   * @param {*} config - config
   * @returns none
   */
  async execute(client, message, args, config) {
    const prefix = config.prefix;
    const commands = client.commands.filter((cmd) => cmd?.showHelp !== false);
    const pageSize = 5; // 1ページあたりのコマンド数
    const totalPages = Math.ceil(commands.size / pageSize);

    let page = 1;

    const generateEmbed = () => {
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      const currentCommands = Array.from(commands.values()).slice(
        startIdx,
        endIdx
      );

      const description = currentCommands
        .map(
          (cmd) =>
            `**${prefix}${cmd.usage}** ${
              cmd.aliases?.length > 0
                ? `(aliases: \`${cmd.aliases.join(", ")}\`)`
                : ""
            } ${cmd.description ?? "No description."}`
        )
        .join("\n");
      const embed = new MessageEmbed()
        .setTitle(`Help - ${page}/${totalPages} (${commands.size} commands)`)
        .setDescription(description)
        .setColor(config.color)
        .setFooter({
          text: `prefix => ${prefix} | {} => required, () => optional`,
        });

      return embed;
    };

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("prev")
        .setLabel("Prev")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle("PRIMARY")
    );

    const messageComponent = await message.reply({
      embeds: [generateEmbed()],
      components: [row],
    });

    const filter = (interaction) => {
      return (
        (interaction.customId === "prev" || interaction.customId === "next") &&
        interaction.user.id === message.author.id
      );
    };

    const collector = messageComponent.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "prev") {
        page = page > 1 ? page - 1 : totalPages;
      } else if (interaction.customId === "next") {
        page = page < totalPages ? page + 1 : 1;
      }

      await interaction.update({ embeds: [generateEmbed()] });
    });

    collector.on("end", () => {
      if (messageComponent.deleted) return;
      row.components.forEach((component) => {
        component.setDisabled(true);
      });
      messageComponent.edit({ components: [row] });
    });
  },
};
