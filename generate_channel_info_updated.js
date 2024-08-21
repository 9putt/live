const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// ฟังก์ชันสำหรับดึง Channel ID จากชื่อช่องโดยใช้ contentforest.com
async function getChannelId(channelUrl) {
    const url = `https://contentforest.com/tools/youtube-channel-id-finder?query=${encodeURIComponent(channelUrl)}`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const channelId = $('#channel-id').val();  // ดึงค่า Channel ID จาก input ที่มี id="channel-id"
        return channelId ? channelId.trim() : null;
    } catch (error) {
        console.error(`Error fetching Channel ID for ${channelUrl}:`, error);
        return null;
    }
}

// ฟังก์ชันสำหรับดึงลิงก์รูปโปรไฟล์ YouTube จากชื่อช่องโดยใช้ contentforest.com
async function getProfilePictureUrl(channelUrl) {
    const url = `https://contentforest.com/tools/youtube-pfp-downloader?query=${encodeURIComponent(channelUrl)}`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const profilePictureUrl = $('#profile-picture img').attr('src');  // ดึง URL รูปโปรไฟล์จาก img ที่มี id="profile-picture"
        return profilePictureUrl ? profilePictureUrl.trim() : null;
    } catch (error) {
        console.error(`Error fetching profile picture for ${channelUrl}:`, error);
        return null;
    }
}

// กำหนดเส้นทางไปยังไฟล์ channel.txt ใน root directory (main directory)
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
fs.writeFileSync(outputFilePath, 'ข้อมูลช่อง, ลิงก์ m3u8, และลิงก์รูปโปรไฟล์:\n\n');

// ทำการประมวลผลข้อมูลช่อง (Channels)
async function processChannels() {
    for (const channel of channels.split('\n')) {
        if (channel.trim()) {
            const cleanChannelName = channel.trim().replace('@', '');  // ลบ '@' ออกจากชื่อช่อง
            const channelUrl = `https://www.youtube.com/${channel.trim()}`;  // สร้าง URL ของช่อง

            console.log(`Fetching Channel ID and profile picture for: ${cleanChannelName}`);

            const channelId = await getChannelId(channelUrl);  // ดึง Channel ID
            const profilePictureUrl = await getProfilePictureUrl(channelUrl);  // ดึงรูปโปรไฟล์

            if (channelId) {
                const m3u8Link = `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`;  // สร้างลิงก์ m3u8 ด้วย Channel ID
                console.log(`Successfully fetched Channel ID: ${channelId} for ${cleanChannelName}`);
                fs.appendFileSync(outputFilePath, `- ${cleanChannelName}\n  ลิงก์ m3u8: ${m3u8Link}\n  ลิงก์รูปโปรไฟล์: ${profilePictureUrl}\n\n`);
            } else {
                console.error(`Failed to fetch Channel ID for ${cleanChannelName}`);
            }
        }
    }
    console.log(`Channel information has been written to ${outputFilePath}`);
}

processChannels();
