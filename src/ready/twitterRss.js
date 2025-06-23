const { Client } = require("discord.js");
const { Webhook } = require("discord-webhook-node");
const Parser = require("rss-parser");
const path = require("path");
const fs = require("fs-extra");

const parser = new Parser();
const saveFile = path.join(__dirname, "../../lib/twitterRss.json");

/**
 * @param {Client} client - Discord.js client
 * @param {*} config - config
 * @returns none
 */
module.exports = (client, config) => {
  try {
    // checkFeed();
    setInterval(checkFeed, 30 * 60 * 1000);
  } catch {}

  async function checkFeed() {
    config.rss.twitter.forEach(async data => {
      const hook = new Webhook(data.webhook);
      hook.setUsername(`Twitter@${data.name}`);
      console.log(`rssTwitter: ${data.name}`);

      try {
        const api = `https://rsshub.app/twitter/user/${data.name}`;
        const feed = await parser.parseURL(api);
        if (feed.items?.length > 0) {
          const sentLinks = load(data.tag);
          const newItems = feed.items.filter(item =>
            !sentLinks.includes(item.link)
          );

          if (newItems.length > 0) {
            const channel = await client.channels.fetch(data.channelId);
            if (channel && channel.type === "GUILD_TEXT") {
              for (const item of newItems.reverse()) {
                const i = item.link;
                const fxLink = i.replace(/^https:\/\/[^/]+/, 'https://fxtwitter.com');
                await hook.send(`新しい投稿:\n[Tweet@${data.name}]( <${i}> )\n-# [fxtwitter link]( ${fxLink} )`);
                sentLinks.push(i);
              }
              await channel.send(`${data.roleId ? `<@&${data.roleId}>\n` : ''}@${data.name}: ${newItems.length} 件の新着ツイート`);
            }
          }
          save(data.tag, newItems);
        }
      } catch (e) {
        console.log("twitterRss: [error] " + e);
      }
    })
  };
};

function load(key) {
  try {
    const data = fs.readJsonSync(saveFile, "utf8");
    return data[key] || [];
  } catch {
    return [];
  }
};

function save(key, items) {
  try {
    const links = items.map(i => i.link);
    const data = fs.readJsonSync(saveFile, "utf8");
    for (const link of links) {
      data[key].push(link);
    }
    fs.writeJsonSync(saveFile, data, { spaces: 2 });
  } catch {}
};
