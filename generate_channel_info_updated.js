const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir);
}

const YOUTUBE_API_KEY = process.env.YOUTUBEKEY; // ดึง API Key จาก Environment Variable
const channelFilePath = path.join(__dirname, 'channel.txt'); // ไฟล์ที่เก็บ URL ของช่อง YouTube

async function getChannelInfo(channelUrl) {
    try {
        const channelName = channelUrl.split('@')[1];
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: channelName,
                type: 'channel',
                key: YOUTUBE_API_KEY
            }
        });

        if (response.data.items.length > 0) {
            const channel = response.data.items[0];
            const channelId = channel.id.channelId;
            const profileImage = channel.snippet.thumbnails.default.url;

            return {
                name: channel.snippet.title,
                id: channelId,
                profileImage: profileImage,
                m3u8Link: `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`
            };
        } else {
            throw new Error(`No channel found for ${channelUrl}`);
        }
    } catch (error) {
        console.error(`Failed to fetch channel info for ${channelUrl}: ${error.message}`);
        return null;
    }
}

async function generateChannelInfo() {
    const channelUrls = fs.readFileSync(channelFilePath, 'utf-8').split('\n').filter(Boolean);

    const channels = [];
    for (const url of channelUrls) {
        const info = await getChannelInfo(url);
        if (info) {
            channels.push(info);
        }
    }

    const dataToWrite = channels.map(channel => {
        return `Channel Name: ${channel.name}\nChannel ID: ${channel.id}\nProfile Image: ${channel.profileImage}\nm3u8 Link: ${channel.m3u8Link}\n\n`;
    }).join('');

    fs.writeFileSync(path.join(distDir, 'channel_info.txt'), dataToWrite);

    console.log('Channel information has been written to ./dist/channel_info.txt');
}

generateChannelInfo();
