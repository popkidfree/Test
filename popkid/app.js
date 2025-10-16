const { gmd } = require("../pop");
const axios = require("axios");

gmd({
  pattern: "apk",
  aliases: ["modapk", "app"],
  react: "📦",
  category: "download",
  description: "Download APK files using NexOracle API",
  use: ".apk <app name>",
}, async (from, Gifted, conText) => {
  const { mek, reply, react, args, sender, pushName, newsletterJid, botName } = conText;

  try {
    const appName = args.join(" ");
    if (!appName)
      return reply("❌ Please provide an app name.\n💡 Example: *.apk whatsapp*");

    await react("⏳");

    const apiUrl = "https://api.nexoracle.com/downloader/apk";
    const params = {
      apikey: "free_key@maher_apis",
      q: appName,
    };

    const response = await axios.get(apiUrl, { params });
    const data = response.data;

    if (!data || data.status !== 200 || !data.result)
      return reply("❌ Unable to find the APK. Please try again later.");

    const { name, lastup, package, size, icon, dllink } = data.result;

    // Send initial message
    await Gifted.sendMessage(
      from,
      {
        image: { url: icon },
        caption: `📦 *Downloading ${name}...*\n\nPlease wait while we fetch the APK file.`,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: 143,
          },
        },
      },
      { quoted: mek }
    );

    // Download the APK file
    const apkRes = await axios.get(dllink, { responseType: "arraybuffer" });
    if (!apkRes.data) return reply("❌ Failed to download the APK.");

    const apkBuffer = Buffer.from(apkRes.data, "binary");

    const captionMsg = `
📦 *ᴀᴘᴋ ᴅᴇᴛᴀɪʟs* 📦

🔖 *Name:* ${name}
📅 *Last Update:* ${lastup}
📦 *Package:* ${package}
📏 *Size:* ${size}

> ᴍᴀᴅᴇ ʙʏ ᴘᴏᴘᴋɪᴅ 💎
`;

    // Send APK file as document
    await Gifted.sendMessage(
      from,
      {
        document: apkBuffer,
        mimetype: "application/vnd.android.package-archive",
        fileName: `${name}.apk`,
        caption: captionMsg,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: 143,
          },
        },
      },
      { quoted: mek }
    );

    await react("✅");
  } catch (error) {
    console.error("APK command error:", error);
    await reply("⚠️ Failed to fetch or send the APK. Try again later.");
    await react("❌");
  }
});
