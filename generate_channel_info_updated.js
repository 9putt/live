const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir);
}

// อ่านลิงก์ YouTube จาก channel.txt
const channelUrls = fs.readFileSync('channel.txt', 'utf-8').split('\n').filter(Boolean);

async function fetchChannelInfo(channelUrl) {
    try {
        // ดึงข้อมูลจาก contentforest.com เพื่อหา Channel ID
        const response = await axios.get('https://contentforest.com/tools/youtube-channel-id-finder', {
            params: { channel: channelUrl }
        });
        
        // ใช้ cheerio เพื่อดึงค่า Channel ID
        const $ = cheerio.load(response.data);
        const channelId = $('input[readonly]').val();

        // ดึงข้อมูลรูปโปรไฟล์จาก contentforest.com อีกฟอร์มหนึ่ง
        const profileImageResponse = await axios.get('https://contentforest.com/tools/youtube-pfp-downloader', {
            params: { channel: channelUrl }
        });
        const profileImage = profileImageResponse.data.profileImage;

        if (channelId && profileImage) {
            return {
                name: channelUrl.split('@')[1],
                id: channelId,
                profileImage: profileImage,
                m3u8Link: `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`
            };
        } else {
            console.error(`Failed to fetch complete info for ${channelUrl}`);
            return null;
        }

    } catch (error) {
        console.error(`Failed to fetch channel info for ${channelUrl}: ${error.message}`);
        return null;
    }
}

async function generateChannelInfo() {
    const channelInfoList = [];

    for (const channelUrl of channelUrls) {
        const channelInfo = await fetchChannelInfo(channelUrl);
        if (channelInfo) {
            channelInfoList.push(channelInfo);
        }
    }

    const dataToWrite = channelInfoList.map(channel => {
        return `Channel Name: ${channel.name}\nChannel ID: ${channel.id}\nProfile Image: ${channel.profileImage}\nm3u8 Link: ${channel.m3u8Link}\n\n`;
    }).join('');

    fs.writeFileSync(path.join(distDir, 'channel_info.txt'), dataToWrite, 'utf8');
    console.log('Channel information has been written to ./dist/channel_info.txt');
}

generateChannelInfo();
