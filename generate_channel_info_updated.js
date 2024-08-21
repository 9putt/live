const axios = require('axios');

async function getChannelInfo(channelNameOrURL) {
    const apiKey = process.env.YOUTUBEKEY; // API key ที่เก็บใน environment variable YOUTUBEKEY
    let channelId = '';

    // ดึงข้อมูล channel ผ่าน API
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: channelNameOrURL,
                type: 'channel',
                key: apiKey
            }
        });

        if (response.data.items.length > 0) {
            const channel = response.data.items[0];
            channelId = channel.id.channelId;
            const profilePicURL = channel.snippet.thumbnails.default.url;
            
            console.log(`Channel ID: ${channelId}`);
            console.log(`Profile Pic URL: ${profilePicURL}`);

            // สร้างลิงก์ m3u8
            const m3u8Link = `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`;
            console.log(`m3u8 Link: ${m3u8Link}`);

            // return ค่า channelId และ profilePicURL
            return { channelId, profilePicURL, m3u8Link };
        } else {
            console.log('ไม่พบช่องที่ระบุ');
            return null;
        }
    } catch (error) {
        console.error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`);
        return null;
    }
}

// ทดสอบการใช้งาน
getChannelInfo('ชื่อช่องหรือURLช่อง');
