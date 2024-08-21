const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const channelFilePath = 'channel.txt';
const outputFilePath = './dist/channel_info.txt';

async function fetchChannelData(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // ดึง Channel ID จาก meta tag ของหน้าเว็บ
        const channelId = $('meta[itemprop="channelId"]').attr('content');

        // ดึง URL ของรูปภาพโปรไฟล์
        const profilePictureUrl = $('meta[property="og:image"]').attr('content');

        return { channelId, profilePictureUrl };
    } catch (error) {
        console.error(`Failed to fetch data for ${url}:`, error);
        return null;
    }
}

async function generateChannelInfo() {
    const channelUrls = fs.readFileSync(channelFilePath, 'utf-8').split('\n').filter(Boolean);
    let channelInfoContent = 'ข้อมูลช่องและลิงก์ m3u8:\n\n';

    for (const url of channelUrls) {
        const channelData = await fetchChannelData(url.trim());
        if (channelData) {
            const { channelId, profilePictureUrl } = channelData;
            const m3u8Link = `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`;
            channelInfoContent += `Channel ID: ${channelId}\nProfile Picture: ${profilePictureUrl}\nM3U8 Link: ${m3u8Link}\n\n`;
        } else {
            console.error(`Failed to fetch data for ${url}`);
        }
    }

    fs.writeFileSync(outputFilePath, channelInfoContent, 'utf-8');
    console.log(`Channel information has been written to ${outputFilePath}`);
}

generateChannelInfo();
