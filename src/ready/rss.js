const { Client } = require("discord.js");
const Parser = require("rss-parser");
const path = require("path");
const fs = require("fs-extra");

const parser = new Parser();
const saveFile = path.join(__dirname, "../../lib/univRss.json");

/**
 * @param {Client} client - Discord.js client
 * @param {*} config - config
 * @returns none
 */
module.exports = async (client, config) => {
  try {
    checkFeed();
    setInterval(checkFeed, 10 * 60 * 1000);
  } catch {}

  async function checkFeed() {
    const rss = config.rss.univ;

    // news
    if (rss.news) {
      for (const data of rss.news) {
        if (data.tag && data.channelId && data.feed) {
          try {
            const api = data.feed;
            const feed = await parser.parseURL(api);
            if (feed.items?.length > 0) {
              const sentLinks = load(data.tag);
              const newItems = feed.items.filter(
                (item) => !sentLinks.includes(item.link)
              );

              if (newItems.length > 0) {
                const channel = await client.channels.fetch(data.channelId);
                if (channel && channel.type === "GUILD_TEXT") {
                  for (const item of newItems /*.reverse()*/ ) {
                    const i = item.link;
                    await channel.send(
                      `新しい投稿:\n[${item?.title || 'NEWS'}]( ${i} )\n${item['content:encodedSnippet'] || ''}`
                    );
                    sentLinks.push(i);
                  }
                  await channel.send(
                    `${newItems.length} 件の新着ニュース`
                  );
                }
              }
              save(data.tag, newItems);
            }
          } catch (e) {
            console.log("rss: [error] " + e);
          }
        } else continue;
      }
    }
  }
};

function load(key) {
  try {
    const data = fs.readJsonSync(saveFile, "utf8");
    return data[key] || [];
  } catch {
    return [];
  }
}

function save(key, items) {
  try {
    const links = items.map((i) => i.link);
    const data = fs.readJsonSync(saveFile, "utf8");
    for (const link of links) {
      data[key].push(link);
    }
    fs.writeJsonSync(saveFile, data, { spaces: 2 });
  } catch {}
}
