const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const apiKey = 'YOUR_YOUTUBE_API_KEY'; // ใส่ YouTube API key ของคุณที่นี่

// Read the channels from txt file
const file = path.join(__dirname, '../channel.txt');
const contents = fs.readFileSync(file, 'utf8');
const channels = contents.split('\n').map(line => line.trim()).filter(line => line.length > 0);

// Function to fetch the Channel ID using the channel name
async function fetchChannelId(channelName) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].snippet.channelId;
        } else {
            console.error(`No channel found for ${channelName}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching channel ID for ${channelName}:`, error);
        return null;
    }
}

// Write playlist to m3u8 file
async function generatePlaylist() {
    const dist = path.join(__dirname, '../dist');
    fs.mkdirSync(dist, { recursive: true });
    const playlist = fs.createWriteStream(dist + '/index.m3u8', { flags: 'w' });

    playlist.write('#EXTM3U\n');

    for (const channelName of channels) {
        const channelId = await fetchChannelId(channelName);
        if (channelId) {
            const m3u8Url = `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`;
            playlist.write(`#EXTINF:-1,${channelName}\n${m3u8Url}\n`);
        }
    }

    playlist.end();
}

generatePlaylist().then(() => console.log('Playlist generated successfully.'));
