const axios = require('axios');

async function getNetflixTokens(jumlah = 1) {
    try {
        let agent;
        if (process.env.PROXY_URL) {
            try {
                const { HttpsProxyAgent } = require('https-proxy-agent');
                agent = new HttpsProxyAgent(process.env.PROXY_URL);
            } catch (_) {
                agent = undefined;
            }
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://token-netflix.vercel.app/'
            },
            timeout: 15000
        };

        if (agent) {
            config.httpsAgent = agent;
            config.proxy = false;
        }

        const res = await axios.post('https://token-netflix.vercel.app/api/generate', {
            count: jumlah
        }, config);

        const rawString = JSON.stringify(res.data);
        const regex = /(Bgiqv[a-zA-Z0-9+\/=_-]{50,})/g;
        const matches = rawString.match(regex);

        if (!matches || matches.length === 0) {
            return {
                status: false,
                message: 'Token tidak ditemukan dalam respons.'
            };
        }

        const uniqueTokens = [...new Set(matches)];
        const formatted = uniqueTokens.map(token => ({
            token: token,
            links: {
                pc: `https://www.netflix.com/browse?nftoken=${token}`,
                android: `nflx://www.netflix.com/browse?nftoken=${token}`,
                tv: `https://www.netflix.com/tv?nftoken=${token}`
            }
        }));

        return {
            status: true,
            total: formatted.length,
            data: formatted
        };
    } catch (err) {
        return {
            status: false,
            message: err.message
        };
    }
}

module.exports = { getNetflixTokens };
