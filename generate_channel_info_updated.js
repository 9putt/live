const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Load the YouTube API key from the environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBEKEY;

// Read the channel URLs from channel.txt
const channelFilePath = './channel.txt';
const channelUrls = fs.readFileSync(channelFilePath, 'utf8').split('\n').filter(Boolean);

async function fetchChannelInfo(url) {
    try {
        // Extract the username from the URL
        const username = url.split('@')[1];

        // Get the Channel ID using the YouTube API
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
            params: {
                part: 'id,snippet',
                forUsername: username,
                key: YOUTUBE_API_KEY
            }
        });

        const channel = response.data.items[0];
        const channelId = channel.id;
        const profileImage = channel.snippet.thumbnails.default.url;

        // Construct the m3u8 link
        const m3u8Link = `https://ythls-v3.onrender.com/channel/${channelId}.m3u8`;

        return {
            name: channel.snippet.title,
            id: channelId,
            profileImage,
            m3u8Link
        };
    } catch (error) {
        console.error(`Failed to fetch Channel ID for ${url}:`, error.message);
        return null;
    }
}

async function generateChannelInfo() {
    const results = [];

    for (const url of channelUrls) {
        const info = await fetchChannelInfo(url);
        if (info) {
            results.push(info);
        }
    }

    // Format and write the results to channel_info.txt
    const outputFilePath = './dist/channel_info.txt';
    const outputData = results.map(info => 
        `Channel Name: ${info.name}\n` +
        `Channel ID: ${info.id}\n` +
        `Profile Image: ${info.profileImage}\n` +
        `m3u8 Link: ${info.m3u8Link}\n`
    ).join('\n');

    fs.writeFileSync(outputFilePath, outputData, 'utf8');
    console.log(`Channel information has been written to ${outputFilePath}`);
}

generateChannelInfo();
