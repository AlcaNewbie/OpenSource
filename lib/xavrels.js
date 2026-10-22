const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://xavrels-multitools.vercel.app';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const CONSTANTS = {
    Creator: 'IzzXd',
    Saluran: 'https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K'
};

let cachedSession = {
    token: null,
    expiresAt: 0
};

async function getSession(force = false) {
    const now = Date.now();
    if (!force && cachedSession.token && cachedSession.expiresAt > now + 30000) {
        return cachedSession.token;
    }

    const res = await axios.post(`${BASE_URL}/api/session`, {}, {
        headers: {
            'Origin': BASE_URL,
            'Referer': `${BASE_URL}/`,
            'User-Agent': USER_AGENT,
            'Accept': 'application/json'
        },
        timeout: 15000
    });

    if (!res.data || !res.data.ok || !res.data.token) {
        throw new Error('Gagal mendapatkan session token dari Xavrels.');
    }

    cachedSession.token = res.data.token;
    cachedSession.expiresAt = now + (res.data.expiresIn || 600) * 1000;
    return cachedSession.token;
}

function getHeaders(token) {
    return {
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/`,
        'User-Agent': USER_AGENT,
        'X-Session-Token': token
    };
}

async function requestWithRetry(endpoint, method = 'POST', data = null, options = {}) {
    let token = await getSession();
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                ...getHeaders(token),
                ...(options.headers || {})
            },
            timeout: options.timeout || 60000,
            responseType: options.responseType || 'json'
        };
        if (data && method.toUpperCase() !== 'GET') {
            config.data = data;
        }
        return await axios(config);
    } catch (err) {
        if (err.response && err.response.status === 401) {
            token = await getSession(true);
            const retryConfig = {
                method,
                url: `${BASE_URL}${endpoint}`,
                headers: {
                    ...getHeaders(token),
                    ...(options.headers || {})
                },
                timeout: options.timeout || 60000,
                responseType: options.responseType || 'json'
            };
            if (data && method.toUpperCase() !== 'GET') {
                retryConfig.data = data;
            }
            return await axios(retryConfig);
        }
        throw err;
    }
}

async function randomCecan(country = 'indonesia') {
    const validCountries = ['indonesia', 'malaysia', 'thailand', 'vietnam', 'china', 'korea', 'jepang'];
    const chosen = validCountries.includes(country.toLowerCase()) ? country.toLowerCase() : 'indonesia';
    const res = await requestWithRetry(`/api/random-cecan?country=${encodeURIComponent(chosen)}`, 'GET', null, {
        responseType: 'arraybuffer'
    });
    return {
        ...CONSTANTS,
        status: true,
        country: chosen,
        contentType: res.headers['content-type'] || 'image/jpeg',
        buffer: Buffer.from(res.data)
    };
}

async function bratVid(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Teks untuk video brat tidak boleh kosong.');
    }
    const res = await requestWithRetry('/api/brat-vid', 'POST', { text }, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'arraybuffer',
        timeout: 90000
    });
    return {
        ...CONSTANTS,
        status: true,
        text,
        contentType: res.headers['content-type'] || 'video/mp4',
        buffer: Buffer.from(res.data)
    };
}

async function iqc(teks, jam = '12.00', batre = 100) {
    if (!teks || typeof teks !== 'string') {
        throw new Error('Teks percakapan IQC tidak boleh kosong.');
    }
    let formattedJam = String(jam || '12.00').trim().replace(':', '.');
    if (!/^\d{1,2}\.\d{2}$/.test(formattedJam)) {
        formattedJam = '12.00';
    }
    const res = await requestWithRetry('/api/iqc-generator', 'POST', {
        teks,
        jam: formattedJam,
        batre: Number(batre) || 100
    }, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'arraybuffer',
        timeout: 30000
    });
    return {
        ...CONSTANTS,
        status: true,
        teks,
        jam: formattedJam,
        batre: Number(batre) || 100,
        contentType: res.headers['content-type'] || 'image/png',
        buffer: Buffer.from(res.data)
    };
}

async function toBlur(imageSource) {
    if (!imageSource) {
        throw new Error('Sumber gambar (URL atau file path) tidak boleh kosong.');
    }
    let postData;
    let extraHeaders = {};

    if (typeof imageSource === 'string' && /^https?:\/\//i.test(imageSource)) {
        postData = { url: imageSource };
        extraHeaders['Content-Type'] = 'application/json';
    } else {
        const filePath = typeof imageSource === 'string' ? imageSource : null;
        const buffer = Buffer.isBuffer(imageSource) ? imageSource : (filePath && fs.existsSync(filePath) ? fs.readFileSync(filePath) : null);
        if (!buffer) {
            throw new Error(`File gambar tidak ditemukan: ${imageSource}`);
        }
        const FormData = require('form-data');
        const form = new FormData();
        form.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
        postData = form;
        extraHeaders = form.getHeaders();
    }

    const res = await requestWithRetry('/api/to-blur', 'POST', postData, {
        headers: extraHeaders,
        responseType: 'arraybuffer',
        timeout: 45000
    });
    return {
        ...CONSTANTS,
        status: true,
        contentType: res.headers['content-type'] || 'image/png',
        buffer: Buffer.from(res.data)
    };
}

async function toBoom(imageSource) {
    if (!imageSource) {
        throw new Error('Sumber gambar (URL atau file path) tidak boleh kosong.');
    }
    let postData;
    let extraHeaders = {};

    if (typeof imageSource === 'string' && /^https?:\/\//i.test(imageSource)) {
        postData = { url: imageSource };
        extraHeaders['Content-Type'] = 'application/json';
    } else {
        const filePath = typeof imageSource === 'string' ? imageSource : null;
        const buffer = Buffer.isBuffer(imageSource) ? imageSource : (filePath && fs.existsSync(filePath) ? fs.readFileSync(filePath) : null);
        if (!buffer) {
            throw new Error(`File gambar tidak ditemukan: ${imageSource}`);
        }
        const FormData = require('form-data');
        const form = new FormData();
        form.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
        postData = form;
        extraHeaders = form.getHeaders();
    }

    const res = await requestWithRetry('/api/to-boom', 'POST', postData, {
        headers: extraHeaders,
        responseType: 'arraybuffer',
        timeout: 45000
    });
    return {
        ...CONSTANTS,
        status: true,
        contentType: res.headers['content-type'] || 'image/jpeg',
        buffer: Buffer.from(res.data)
    };
}

async function fpreset(tiktokUrl) {
    if (!tiktokUrl || !/^https?:\/\//i.test(tiktokUrl)) {
        throw new Error('Masukkan link video TikTok yang valid.');
    }
    const res = await requestWithRetry('/api/fpreset', 'POST', { url: tiktokUrl }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
    });
    const data = res.data;
    if (!data || !data.ok) {
        throw new Error(data?.error || 'Gagal mengambil preset Free Fire.');
    }
    return {
        ...CONSTANTS,
        status: true,
        ...data
    };
}

async function react(waChannelUrl, emoji) {
    if (!waChannelUrl || !emoji) {
        throw new Error('URL WhatsApp Channel dan emoji wajib diisi.');
    }
    const deviceId = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const res = await requestWithRetry('/api/react', 'POST', {
        deviceId,
        url: waChannelUrl,
        emoji
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
    });
    const data = res.data;
    if (!data || !data.ok) {
        throw new Error(data?.error || 'Gagal mengirim reaction ke channel WhatsApp.');
    }
    return {
        ...CONSTANTS,
        status: true,
        ...data
    };
}

module.exports = {
    getSession,
    randomCecan,
    bratVid,
    iqc,
    toBlur,
    toBoom,
    fpreset,
    react
};
