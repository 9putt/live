const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // โหลด dotenv เพื่อใช้งาน API key

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir);
}

// สร้างลิงก์ m3u8 โดยใช้ API key ที่ดึงมาจากไฟล์ .env หรือจาก secrets ใน GitHub
const YOUTUBE_API_KEY = process.env.YOUTUBEKEY;

const channels = [
  "https://youtube.com/@voicetv",
  "https://youtube.com/@MBCNEWS11",
  "https://youtube.com/@letanahotelrestaurant24hrs"
];

async function getChannelInfo(url) {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${url}&key=${YOUTUBE_API_KEY}`);
    const channel = response.data.items[0];
    const channelId = channel.id;
    const profileImage = channel.snippet.thumbnails.default.url;
    return {
      name: channel.snippet.title,
      id: channelId,
      profileImage: profileImage,
      m3u8Link: `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`
    };
  } catch (error) {
    console.error(`Failed to fetch data for ${url}`, error);
    return null;
  }
}

(async () => {
  const results = await Promise.all(channels.map(getChannelInfo));
  const dataToWrite = results.filter(Boolean).map(channel => {
    return `Channel Name: ${channel.name}\nChannel ID: ${channel.id}\nProfile Image: ${channel.profileImage}\nm3u8 Link: ${channel.m3u8Link}\n\n`;
  }).join('');

  fs.writeFileSync(path.join(distDir, 'channel_info.txt'), dataToWrite);
  console.log('Channel information has been written to', path.join(distDir, 'channel_info.txt'));
})();
