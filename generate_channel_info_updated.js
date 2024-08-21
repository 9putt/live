const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const channels = [
  // รายชื่อช่องแบบ URL เช่น
  'https://www.youtube.com/@INNNEWS_INN',
  'https://www.youtube.com/@Mono29tv'
];

// ฟังก์ชันสำหรับดึงข้อมูล Channel ID และรูปโปรไฟล์
async function fetchChannelInfo(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // ดึง Channel ID
    const channelID = $('meta[itemprop="channelId"]').attr('content');
    
    // ดึงรูปโปรไฟล์
    const profilePic = $('meta[property="og:image"]').attr('content');
    
    return { channelID, profilePic };
  } catch (error) {
    console.error(`Failed to fetch Channel ID for ${url}`);
    return null;
  }
}

// ฟังก์ชันหลักสำหรับการประมวลผลข้อมูลช่อง
async function generateChannelInfo() {
  const channelInfoList = [];

  for (const channelUrl of channels) {
    const info = await fetchChannelInfo(channelUrl);
    if (info) {
      channelInfoList.push({
        url: channelUrl,
        id: info.channelID,
        profilePic: info.profilePic,
      });
    }
  }

  const outputPath = path.join(__dirname, 'channel_info.txt');
  const channelInfoData = channelInfoList.map(info => 
    `Channel: ${info.url}\nID: ${info.id}\nProfile Pic: ${info.profilePic}\n`
  ).join('\n');

  fs.writeFileSync(outputPath, channelInfoData, 'utf8');
  console.log('Channel information has been written to', outputPath);
}

generateChannelInfo();
