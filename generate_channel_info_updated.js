const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// ตรวจสอบว่ามีโฟลเดอร์ dist อยู่แล้วหรือไม่ ถ้าไม่มีจะสร้างขึ้นมา
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// อ่าน URL ของช่องจากไฟล์ channel.txt
const channelFilePath = path.join(__dirname, 'channel.txt');
const channelUrls = fs.readFileSync(channelFilePath, 'utf-8').split('\n').filter(Boolean);

const scrapeChannelInfo = async (channelUrl) => {
    try {
        const { data } = await axios.get(`https://contentforest.com/tools/youtube-channel-id-finder?url=${encodeURIComponent(channelUrl)}`);
        const $ = cheerio.load(data);

        const channelId = $('#result').text().trim();
        if (!channelId) throw new Error('Channel ID not found');

        const profileImage = await scrapeProfileImage(channelId);

        return {
            url: channelUrl,
            id: channelId,
            profileImage,
            m3u8Link: `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`
        };
    } catch (error) {
        console.error(`Failed to fetch channel info for ${channelUrl}: ${error.message}`);
        return null;
    }
};

const scrapeProfileImage = async (channelId) => {
    try {
        const { data } = await axios.get(`https://contentforest.com/tools/youtube-pfp-downloader?url=${encodeURIComponent(`https://www.youtube.com/channel/${channelId}`)}`);
        const $ = cheerio.load(data);

        const profileImageUrl = $('#result img').attr('src');
        if (!profileImageUrl) throw new Error('Profile image not found');

        return profileImageUrl;
    } catch (error) {
        console.error(`Failed to fetch profile image for Channel ID: ${channelId}`);
        return null;
    }
};

const generateChannelInfo = async () => {
    const channels = [];
    for (const url of channelUrls) {
        const info = await scrapeChannelInfo(url);
        if (info) channels.push(info);
    }

    const dataToWrite = channels.map(channel => {
        return `Channel URL: ${channel.url}\nChannel ID: ${channel.id}\nProfile Image: ${channel.profileImage}\nm3u8 Link: ${channel.m3u8Link}\n\n`;
    }).join('');

    fs.writeFileSync(path.join(distDir, 'channel_info.txt'), dataToWrite);
    console.log('Channel information has been written to ./dist/channel_info.txt');
};

generateChannelInfo();
