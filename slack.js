const axios = require('axios');
const config = require('./config');

async function sendText(text) {
    try {
        const response = await axios.post(config.slackWebhook, {
            text: text,
        }, {
            timeout: 5000,
        });
    } catch (err) {
        throw new Error('send text to slack failed');
    }
}

module.exports = {
    sendText,
}