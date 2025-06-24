const { Client, Message, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, Modal, TextInputComponent, Permissions } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "textstamp",
  usage: "textstamp {text}",
  aliases: ["ts"],
  description: "テキストから絵文字を作成します",
  /**
   * @param {Client} client - Discord.js client
   * @param {Message} message - Discord.js message
   * @param {string[]} args - args
   * @param {*} config - config
   */
  async execute(client, message, args, config) {
    try {
      if (
        !message.guild.me.permissions.has(
          Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS
        )
      ) {
        return message.reply("ボットの権限が不足しています");
      }
      if (
        !message.member.permissions.has(
          Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS
        )
      ) {
        return message.reply("あなたの権限が不足しています");
      }

      const msg = await message.reply(`Loading...`);

      const fonts = {
        "notosans-mono-bold": {
          name: "Noto Sans Mono CJK JP Bold",
          emoji: "1377318000276803766",
        },
        "mplus-1p-black": {
          name: "M+ 1p black",
          emoji: "1377318031889268826"
        },
        "rounded-x-mplus-1p-black": {
          name: "Rounded M+ 1p black",
          emoji: "1377318051560816861",
        },
        ipamjm: {
          name: "IPAmj明朝",
          emoji: "1377318071068393492"
        },
        aoyagireisyoshimo: {
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
        return `https://emoji-gen.ninja/emoji?align=left&back_color=00000000&color=${input.color.replace("#", "")}FF&font=${input.font}&locale=ja&public_fg=true&size_fixed=false&stretch=true&text=${encodeURIComponent(input.text)}`;
      };

      const generateEmbed = (input) => {
        return new MessageEmbed()
          .setTitle("テキスト絵文字作成")
          .setDescription(
            `テキスト:\n${input.text}\nフォント: ${fonts[input.font].name}\n色: ${input.color}`
          )
          .setImage("attachment://textstamp.png")
          .setColor(config.color);
      };

      const generateImage = async (input) => {
        const image = await fetch(url(input)).then((res) => res.blob());
        const attachment = new MessageAttachment(
          image.stream(),
          "textstamp.png"
        );
        return attachment;
      };

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

      const row3 = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("ts-add-emoji")
          .setLabel("絵文字として追加")
          .setStyle("SUCCESS")
      );

      const messageComponent = await msg.edit({
        content: null,
        embeds: [generateEmbed(input)],
        files: [await generateImage(input)],
        components: [row, row2, row3],
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
        try {
          if (interaction.customId === "ts-color") {
            const modal = new Modal()
              .setCustomId("ts-color-modal")
              .setTitle("色変更")
              .addComponents(
                new MessageActionRow().addComponents(
                  new TextInputComponent()
                    .setCustomId("color-input")
                    .setLabel("色: #RRGGBB")
                    .setStyle("SHORT")
                    .setRequired(true)
                )
              );

            await interaction.showModal(modal);
            const modalSubmit = await interaction
              .awaitModalSubmit({
                filter: (i) =>
                  i.customId === "ts-color-modal" &&
                  i.user.id === message.author.id,
                time: 60000,
              })
              .catch(() => null);

            if (!modalSubmit) return;

            const colorInput =
              modalSubmit.fields.getTextInputValue("color-input");
            const hexColor = /^#?([0-9A-F]{6})$/i;

            if (!hexColor.test(colorInput)) {
              return await modalSubmit.reply({
                content: "無効な色形式です\n#RRGGBB の形式で入力してください",
                ephemeral: true,
              });
            }

            input.color = colorInput.startsWith("#")
              ? colorInput.toUpperCase()
              : `#${colorInput.toUpperCase()}`;

            await modalSubmit.update({
              embeds: [generateEmbed(input)],
              files: [await generateImage(input)],
              components: [row, row2, row3],
            });
          } else if (interaction.customId === "ts-add-emoji") {
            const modalId = `ts-add-modal-emoji-${interaction.id}`;
            const modal = new Modal()
              .setCustomId(modalId)
              .setTitle("絵文字の名前を入力");
            const nameInput = new TextInputComponent()
              .setCustomId("name-input")
              .setLabel("名前")
              .setStyle("SHORT")
              .setRequired(true)
              .setPlaceholder("2〜32文字の英数字とアンダースコア")
              .setMinLength(2)
              .setMaxLength(32);
            modal.addComponents(
              new MessageActionRow().addComponents(nameInput)
            );
            await interaction.showModal(modal);

            const modalSubmit = await interaction
              .awaitModalSubmit({
                filter: (i) =>
                  i.customId === modalId && i.user.id === message.author.id,
                time: 60000,
              })
              .catch(() => null);

            if (!modalSubmit) return;

            const name = modalSubmit.fields.getTextInputValue("name-input");
            const imageUrl = url(input);

            const emojiRegex = /^[a-zA-Z0-9_]{2,32}$/;
            if (!emojiRegex.test(name)) {
              return modalSubmit.reply({
                content:
                  "絵文字の名前は2〜32文字の英数字とアンダースコア(_)のみ使用できます",
                ephemeral: true,
              });
            }

            try {
              await modalSubmit.deferReply({ ephemeral: true });
              const createdEmoji = await interaction.guild.emojis.create(
                imageUrl,
                name,
                { reason: `テキストスタンプ by ${message.author.tag}` }
              );
              await modalSubmit.editReply(
                `${createdEmoji} をサーバーに追加しました`
              );
            } catch (error) {
              console.error(error);
              await modalSubmit.editReply("絵文字の追加に失敗しました");
            }
          } else if (interaction.customId.startsWith("ts-")) {
            const fontKey = interaction.customId.slice(3);
            input.font = fontKey;

            row2.components.forEach((component) => {
              component.setStyle(
                component.customId === interaction.customId
                  ? "PRIMARY"
                  : "SECONDARY"
              );
              component.setDisabled(
                component.customId === interaction.customId
              );
            });

            await interaction.update({
              embeds: [generateEmbed(input)],
              files: [await generateImage(input)],
              components: [row, row2, row3],
            });
          }
        } catch (e) {
          console.error(e);
          if (!interaction.replied && !interaction.deferred) {
            await interaction
              .reply({
                content: "処理中にエラーが発生しました",
                ephemeral: true,
              })
              .catch(() => {});
          } else {
            await interaction
              .editReply({
                content: "処理中にエラーが発生しました",
                embeds: [],
                components: [],
              })
              .catch(() => {});
          }
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
        row3.components.forEach((component) => {
          component.setDisabled(true);
        });
        messageComponent.edit({ components: [row, row2, row3] });
      });
    } catch (e) {
      console.error(e);
      await message.reply("コマンドの実行中にエラーが発生しました");
    }
  },
};
