const axios = require('axios');

const WM = {
    Creator: 'IzzXd',
    Saluran: 'https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K'
};

const API_BASE = 'https://api.v02.savethevideo.com';

const HEADERS = {
    'Content-Type': 'application/json',
    'Origin': 'https://www.savethevideo.com',
    'Referer': 'https://www.savethevideo.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
};

async function dl(targetUrl, timeoutMs = 30000) {
    const url = targetUrl.trim();
    const postRes = await axios.post(`${API_BASE}/tasks`, {
        type: 'info',
        url
    }, {
        headers: HEADERS,
        timeout: 10000
    });

    const task = postRes.data;
    if (!task || !task.href) {
        throw new Error('Gagal membuat task konversi');
    }

    const startTime = Date.now();
    let taskData = task;

    while (Date.now() - startTime < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const pollRes = await axios.get(`${API_BASE}${task.href}`, {
            headers: HEADERS,
            timeout: 10000
        });

        taskData = pollRes.data;
        if (taskData.state === 'completed') {
            break;
        }
        if (taskData.state === 'failed') {
            const err = taskData.error || {};
            throw new Error(err.message || 'Ekstraksi video gagal');
        }
    }

    if (taskData.state !== 'completed') {
        throw new Error('Proses polling timeout');
    }

    const result = taskData.result || {};
    const rawFormats = result.formats || [];

    const formats = rawFormats.map(f => ({
        format_id: f.format_id || f.id || null,
        quality: f.format_note || f.resolution || f.quality || null,
        extension: f.ext || null,
        file_size: f.filesize ? `${(f.filesize / 1024 / 1024).toFixed(2)} MB` : null,
        url: f.url || null
    }));

    return {
        ...WM,
        status: true,
        url,
        title: result.title || null,
        duration: result.duration || null,
        thumbnail: result.thumbnail || null,
        uploader: result.uploader || null,
        formats
    };
}

module.exports = {
    dl
};
