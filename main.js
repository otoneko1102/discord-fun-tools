require("dotenv").config();

const config = require("./config");

const { Client, Collection } = require("discord.js");
const client = new Client({ intents: config.intents });

const path = require("path");
const fs = require("fs-extra");

// Prefix commands
const commandsPath = "./src/messageCreate/commands";
const commandsFiles = fs.readdirSync(path.join(__dirname, commandsPath)).filter(file => file.endsWith(".js"));
client.commands = new Collection();
for (const file of commandsFiles) {
  const command = require(`${commandsPath}/${file}`);
  client.commands.set(command.name, command);
  console.log(`command: ${file} ready!`);
}

// messageCreate events
const messageCreatePath = "./src/messageCreate";
const messageCreateFiles = fs.readdirSync(path.join(__dirname, messageCreatePath)).filter(file => file.endsWith(".js"));
client.messageCreate = [];
for (const file of messageCreateFiles) {
  const command = require(`${messageCreatePath}/${file}`);
  client.messageCreate.push(command);
  console.log(`messageCreate: ${file} ready!`);
}

// messageUpdate events
const messageUpdatePath = "./src/messageUpdate";
const messageUpdateFiles = fs.readdirSync(path.join(__dirname, messageUpdatePath)).filter(file => file.endsWith(".js"));
client.messageUpdate = [];
for (const file of messageUpdateFiles) {
  const command = require(`${messageUpdatePath}/${file}`);
  client.messageUpdate.push(command);
  console.log(`messageUpdate: ${file} ready!`);
}

// GuildMemberAdd events
const guildMemberAddPath = "./src/guildMemberAdd";
const guildMemberAddFiles = fs.readdirSync(path.join(__dirname, guildMemberAddPath)).filter(file => file.endsWith(".js"));
client.guildMemberAdd = [];
for (const file of guildMemberAddFiles) {
  const command = require(`${guildMemberAddPath}/${file}`);
  client.guildMemberAdd.push(command);
  console.log(`guildMemberAdd: ${file} ready!`);
}

// Ready events
const readyPath = "./src/ready";
const readyFiles = fs.readdirSync(path.join(__dirname, readyPath)).filter(file => file.endsWith(".js"));
client.ready = [];
for (const file of readyFiles) {
  const command = require(`${readyPath}/${file}`);
  client.ready.push(command);
  console.log(`ready: ${file} ready!`);
}

client.on("messageCreate", async message => {
  // Prefix commands
  if (message.content.startsWith(config.prefix) && !message.author.bot) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (command) {
      try {
        command.execute(client, message, args, config);
      } catch (e) {
        console.error("Prefix commands error: " + e);
      }
    }
  }

  // MessageCreate events
  client.messageCreate.forEach(handler => {
    try {
      handler(client, message, config);
    } catch (e) {
      console.error("MessageCreate events error: " + e);
    }
  });
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  // MessageUpdate events
  client.messageUpdate.forEach(handler => {
    try {
      handler(client, oldMessage, newMessage, config);
    } catch (e) {
      console.error("MessageUpdate events error: " + e);
    }
  });
});

client.on("guildMemberAdd", async member => {
  // GuildMemberAdd events
  client.guildMemberAdd.forEach(handler => {
    try {
      handler(client, member, config);
    } catch (e) {
      console.error("GuildMemberAdd events error: " + e);
    }
  })
})

client.on("ready", async () => {
  // Ready events
  client.ready.forEach(handler => {
    try {
      handler(client, config);
    } catch (e) {
      console.error("Ready events error: " + e);
    }
  });

  console.log(`${client.user.tag} OK!`)
});

client.login(process.env.DISCORD_BOT_TOKEN);
