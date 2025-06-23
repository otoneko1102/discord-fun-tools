const { Client, Message, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
  name: "textstamp",
  usage: "textstamp {text}",
  aliases: ["ts"],
  description: "テキストスタンプを作成します",
  /**
   * @param {Client} client - Discord.js client
   * @param {Message} message - Discord.js message
   * @param {string[]} args - args
   * @param {*} config - config
   * @returns none
   */
  async execute(client, message, args, config) {
    try {
      const msg = await message.reply(`Loading...`);

      const fonts = {
        "notosans-mono-bold": {
          name: "Noto Sans Mono CJK JP Bold",
          emoji: "1377318000276803766",
        },
        "mplus-1p-black": {
          name: "M+ 1p black",
          emoji: "1377318031889268826",
        },
        "rounded-x-mplus-1p-black": {
          name: "Rounded M+ 1p black",
          emoji: "1377318051560816861",
        },
        "ipamjm": {
          name: "IPAmj明朝",
          emoji: "1377318071068393492",
        },
        "aoyagireisyoshimo": {
          name: "青柳隷書しも",
          emoji: "1377318085693935766",
        },
      };

      if (args.length == 0)
        return await message.reply("テキストを入力してください");

      const input = {
        text: args.join(" "),
        font: "notosans-mono-bold",
        color: "#EC71A1",
      };

      const url = (input) => {
        return `https://emoji-gen.ninja/emoji?align=left&back_color=00000000&color=${input.color.replace("#","")}FF&font=${input.font}&locale=ja&public_fg=true&size_fixed=false&stretch=true&text=${encodeURIComponent(input.text)}`;
      };

      const generateEmbed = (input) => {
        const embed = new MessageEmbed()
          .setTitle("テキストスタンプ作成")
          .setDescription(
            `テキスト:\n${input.text}\nフォント: ${
              fonts[input.font].name
            }\n色: ${input.color}`
          )
          .setImage('attachment://textstamp.png')
          .setColor(config.color);
        return embed;
      };

      const generateImage = async (input) => {
        const image = await fetch(url(input)).then(res => res.blob());
        const attachment = new MessageAttachment(image.stream(), "textstamp.png");
        return attachment;
      }

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("色変更")
          .setEmoji("1209441496076652635")
          .setStyle("SECONDARY")
          .setCustomId("ts-color")
      );
      const row2 = new MessageActionRow().addComponents(
        ...Object.keys(fonts).map((key) =>
          new MessageButton()
            .setEmoji(fonts[key].emoji)
            .setCustomId(`ts-${key}`)
            .setStyle(key === input.font ? "PRIMARY" : "SECONDARY")
            .setDisabled(key === input.font)
        )
      );

      const messageComponent = await msg.edit({
        content: null,
        embeds: [generateEmbed(input)],
        files: [await generateImage(input)],
        components: [row, row2],
      });

      const filter = (interaction) => {
        return (
          interaction.customId?.startsWith("ts-") &&
          interaction.user.id === message.author.id
        );
      };

      const collector = messageComponent.createMessageComponentCollector({
        filter,
        time: 300000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "ts-color") {
          const modal = new Modal()
            .setCustomId("ts-color-modal")
            .setTitle("色変更")
            .addComponents(
              new MessageActionRow().addComponents(
                new TextInputComponent()
                  .setCustomId("color-input")
                  .setLabel("色 (RGB or HEX)")
                  .setStyle("SHORT")
                  .setRequired(true)
              )
            );

          await interaction.showModal(modal);
          const modalSubmit = await interaction.awaitModalSubmit({
            filter: (i) =>
              i.customId === "ts-color-modal" &&
              i.user.id === message.author.id,
            time: 60000,
          });

          const colorInput =
            modalSubmit.fields.getTextInputValue("color-input");
          const hexColor = /^#?[0-9A-F]{6}$/i;
          const rgbColorComma = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/;
          const rgbColorSpace = /^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/;

          let newColor;
          if (hexColor.test(colorInput)) {
            newColor = colorInput.startsWith("#")
              ? colorInput.toUpperCase()
              : `#${colorInput.toUpperCase()}`;
          } else if (rgbColorComma.test(colorInput)) {
            const rgbMatch = colorInput.match(rgbColorComma);
            newColor = `#${parseInt(rgbMatch[1])
              .toString(16)
              .padStart(2, "0")}${parseInt(rgbMatch[2])
              .toString(16)
              .padStart(2, "0")}${parseInt(rgbMatch[3])
              .toString(16)
              .padStart(2, "0")}`.toUpperCase();
          } else if (rgbColorSpace.test(colorInput)) {
            const rgbMatch = colorInput.match(rgbColorSpace);
            newColor = `#${parseInt(rgbMatch[1])
              .toString(16)
              .padStart(2, "0")}${parseInt(rgbMatch[2])
              .toString(16)
              .padStart(2, "0")}${parseInt(rgbMatch[3])
              .toString(16)
              .padStart(2, "0")}`.toUpperCase();
          } else {
            return await modalSubmit.reply({
              content: "無効な色形式です",
              ephemeral: true,
            });
          }

          if (!hexColor.test(newColor))
            return await modalSubmit.reply({
              content: "無効な色形式です",
              ephemeral: true,
            });

          input.color = newColor;
          await modalSubmit.update({
            embeds: [generateEmbed(input)],
            files: [await generateImage(input)]
          });
        } else if (interaction.customId.startsWith("ts-")) {
          const fontKey = interaction.customId.slice(3);
          input.font = fontKey;

          row2.components.forEach((component) => {
            component.setStyle(
              component.customId === interaction.customId
                ? "PRIMARY"
                : "SECONDARY"
            );
            component.setDisabled(component.customId === interaction.customId);
          });

          await interaction.update({
            embeds: [generateEmbed(input)],
            files: [await generateImage(input)],
            components: [row, row2],
          });
        }
      });

      collector.on("end", () => {
        if (messageComponent.deleted) return;
        row.components.forEach((component) => {
          component.setDisabled(true);
        });
        row2.components.forEach((component) => {
          component.setDisabled(true);
        });
        messageComponent.edit({ components: [row, row2] });
      });
    } catch (e) {
      console.error(e);
      await message.reply("エラーが発生しました");
    }
  },
};
