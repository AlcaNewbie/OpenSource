const axios = require('axios');
async function getNetflixTokens(count = 1) {
    try {
        const res = await axios.post('https://token-netflix.vercel.app/api/generate', 
            { count: parseInt(count), stream: false },
            { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 20000 }
        );
        return { creator: 'AlcaW44', saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', ...res.data };
    } catch (e) { return { status: false, message: e.message }; }
}
module.exports = { getNetflixTokens };
