const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ใช้ API Key ของคุณที่ถูกตั้งค่าใน GitHub Secrets
const apiKey = process.env.YOUTUBEKEY;

// ฟังก์ชันสำหรับดึง Channel ID จากชื่อช่อง
async function getChannelId(channelName) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=channel&q=${channelName}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        if (response.data.items && response.data.items.length > 0) {
            return response.data.items[0].id.channelId;
        } else {
            console.error(`Channel not found: ${channelName}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching channel ID for ${channelName}:`, error);
        return null;
    }
}

// กำหนดเส้นทางไปยังไฟล์ channel.txt ใน root directory
const channelFilePath = path.join(__dirname, 'channel.txt');

// ตรวจสอบว่าไฟล์ channel.txt มีอยู่หรือไม่
if (!fs.existsSync(channelFilePath)) {
    console.error(`Error: File not found - ${channelFilePath}`);
    process.exit(1); // ออกจากโปรแกรมด้วยโค้ด 1 เพื่อแสดงว่าเกิดข้อผิดพลาด
}

// อ่านข้อมูลจากไฟล์ channel.txt
const channels = fs.readFileSync(channelFilePath, 'utf8');

// สร้างโฟลเดอร์ dist ถ้าไม่มี
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// สร้างไฟล์ output channel_info.txt
const outputFilePath = path.join(distDir, 'channel_info.txt');

// เขียนข้อมูลช่องไปยังไฟล์ channel_info.txt
fs.writeFileSync(outputFilePath, 'ข้อมูลช่องและลิงก์ m3u8:\n\n');

// ทำการประมวลผลข้อมูลช่อง (Channels)
async function processChannels() {
    for (const channel of channels.split('\n')) {
        if (channel.trim()) {
            const cleanChannelName = channel.trim().replace('@', ''); // ลบ '@' ออกจากชื่อช่อง
            console.log(`Trying to fetch Channel ID for: ${cleanChannelName}`);
            const channelId = await getChannelId(cleanChannelName); // ดึง Channel ID จาก YouTube API
            if (channelId) {
                const m3u8Link = `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`; // สร้างลิงก์ m3u8 ด้วย Channel ID
                console.log(`Successfully fetched Channel ID: ${channelId} for ${cleanChannelName}`);
                fs.appendFileSync(outputFilePath, `- ${cleanChannelName}\n  ลิงก์: ${m3u8Link}\n`);
            } else {
                console.error(`Failed to fetch Channel ID for ${cleanChannelName}`);
            }
        }
    }
    console.log(`Channel information has been written to ${outputFilePath}`);
}

processChannels();
