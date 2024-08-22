const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// ฟังก์ชันเพื่อดึง Channel ID จาก URL ของ YouTube
async function getChannelId(url) {
    try {
        // ส่งคำขอไปยังหน้าเว็บที่ใช้ดึง Channel ID
        const response = await axios.get(`https://contentforest.com/tools/youtube-channel-id-finder?url=${encodeURIComponent(url)}`);
        const html = response.data;

        // โหลด HTML เข้า cheerio เพื่อทำการ parse
        const $ = cheerio.load(html);

        // ค้นหา Channel ID ใน HTML (ตามตัวอย่างคือ div ที่มี class 'output' หรือที่เหมาะสมตามโครงสร้างจริงของเว็บ)
        const channelId = $('.channel-id-output').text().trim(); // คุณอาจต้องปรับ class ตามที่หน้าเว็บใช้

        if (channelId) {
            return channelId;
        } else {
            throw new Error('Channel ID not found');
        }
    } catch (error) {
        console.error(`Failed to fetch Channel ID for ${url}:`, error.message);
        return null;
    }
}

// ฟังก์ชันหลักสำหรับการประมวลผลข้อมูล
async function main() {
    const channelUrls = [
        'https://youtube.com/@voicetv',
        'https://youtube.com/@MBCNEWS11',
        'https://youtube.com/@letanahotelrestaurant24hrs'
    ];

    const results = [];

    for (const url of channelUrls) {
        const channelId = await getChannelId(url);
        if (channelId) {
            const m3u8Link = `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`;
            results.push({
                url,
                channelId,
                m3u8Link
            });
        }
    }

    // กำหนดโฟลเดอร์ dist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    // เขียนข้อมูลลงในไฟล์ channel_info.txt
    const outputFilePath = path.join(distDir, 'channel_info.txt');
    const outputData = results.map(result => 
        `Channel URL: ${result.url}\nChannel ID: ${result.channelId}\nm3u8 Link: ${result.m3u8Link}\n`
    ).join('\n');

    fs.writeFileSync(outputFilePath, outputData, 'utf8');
    console.log(`Channel information has been written to ${outputFilePath}`);
}

main();
