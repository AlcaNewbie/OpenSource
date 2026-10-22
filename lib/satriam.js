const axios = require('axios');

const BASE_URL = 'https://satriam.satriadeveloperz.workers.dev';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'User-Agent': UA,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
    }
});

async function sendLink(email) {
    if (!email) {
        throw new Error('Email tujuan wajib diisi!');
    }

    const res = await client.post('/api/satriam/send-link', {
        email: email.trim()
    });

    const data = res.data;
    return {
        Creator: 'IzzXd',
        Saluran: 'https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K',
        status: data?.success !== undefined ? data.success : true,
        email: data?.email || email.trim(),
        message: data?.message || 'Magic link berhasil dikirim ke email.'
    };
}

async function verifyLink(email, magicLink) {
    if (!email || !magicLink) {
        throw new Error('Email dan Magic Link wajib diisi!');
    }

    const res = await client.post('/api/satriam/verify-link', {
        email: email.trim(),
        magicLink: magicLink.trim()
    });

    const data = res.data;
    return {
        Creator: 'IzzXd',
        Saluran: 'https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K',
        status: data?.success !== undefined ? data.success : true,
        ...data
    };
}

module.exports = {
    sendLink,
    verifyLink
};
