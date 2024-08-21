const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Path to the channels.txt
const channelsFilePath = path.join(__dirname, '../channels.txt');

// Read channels.txt file
const channels = fs.readFileSync(channelsFilePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

// Function to fetch the Channel ID using the channel name
async function fetchChannelId(channelName) {
    const apiKey = 'YOUR_YOUTUBE_API_KEY';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const channelId = data.items[0].snippet.channelId;
            return channelId;
        } else {
            console.error(`No channel found for ${channelName}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching channel ID for ${channelName}:`, error);
        return null;
    }
}

// Function to generate the .m3u8 URL
function generateM3u8Url(channelId) {
    return `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`;
}

// Fetch Channel IDs and generate .m3u8 URLs for all channels
async function processChannels() {
    const m3u8Urls = [];

    for (const channel of channels) {
        const channelId = await fetchChannelId(channel);
        if (channelId) {
            const m3u8Url = generateM3u8Url(channelId);
            m3u8Urls.push(m3u8Url);
            console.log(`Generated .m3u8 URL for ${channel}: ${m3u8Url}`);
        }
    }

    return m3u8Urls;
}

processChannels().then(urls => {
    console.log('All .m3u8 URLs:', urls);
});
