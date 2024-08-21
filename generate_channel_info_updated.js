const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ตรวจสอบว่ามีโฟลเดอร์ dist อยู่แล้วหรือไม่ ถ้าไม่มีก็สร้างใหม่
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir);
}

// ตัวอย่างข้อมูลที่จะเขียนลงไฟล์ channel_info.txt
const channels = [
    {
        name: "Sample Channel",
        id: "UC1234567890ABCDEF",
        profileImage: "https://example.com/profile.jpg",
        m3u8Link: "https://ythls-v3.onrender.com/channel/UC1234567890ABCDEF.m3u8"
    }
];

// สร้างข้อมูลเป็นข้อความเพื่อเขียนลงไฟล์
const dataToWrite = channels.map(channel => {
    return `Channel Name: ${channel.name}\nChannel ID: ${channel.id}\nProfile Image: ${channel.profileImage}\nm3u8 Link: ${channel.m3u8Link}\n\n`;
}).join('');

// เขียนไฟล์ในโฟลเดอร์ dist
fs.writeFileSync(path.join(distDir, 'channel_info.txt'), dataToWrite, 'utf8');

console.log("Channel information has been written to", path.join(distDir, 'channel_info.txt'));
