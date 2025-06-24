// <@!?\d+>
function removes(content) {
  return content.replace(/<@!?\d+>|<@&\d+>|<#\d+>/g, "").replace(/\n/g, '').replace(/[　\u0020]/g, '');
}
function isOnlyKanji(input) {
  if (typeof input !== 'string') return false;
  input = removes(input);

  // 漢字のUnicode範囲
  const kanjiRegex = /[\p{Ideographic}]/u;

  // 許可される記号
  const allowedSymbols = "｡､☆★♡♥%％○○□◇◆△▽▲▼■+×-÷＋╋✕－:：;；〒々〆⤴︎⤵︎←↓↑→#＃=|｜$＄¥￥＝ヶヵ々/／ー_＿^＾~〜!?！？°。、「」（）'\"@()<>【】『』［］[]“”‘’〈〉《》〔〕｛｝{}〚〛〘〙〝〟«»‹›";

  for (const char of input) {
    if (
      !kanjiRegex.test(char) && // 漢字でない
      !allowedSymbols.includes(char) // 許可された記号でない
    ) {
      return false;
    }
  }
  return true;
}

function containsSticker(message) {
  return message.stickers?.first();
}

function setChannelSlowmode(message) {
  const channel = message.channel;
  const currentSlowmode = channel.rateLimitPerUser;
  const desiredSlowmode = 3;

  if (currentSlowmode !== desiredSlowmode) {
    channel.setRateLimitPerUser(desiredSlowmode)
      .then(() => {
        console.log(`Slowmode set to ${desiredSlowmode} second(s).`);
      })
      .catch(console.error);
  }
}

module.exports = {
  removes,
  isOnlyKanji,
  containsSticker,
  setChannelSlowmode
};
