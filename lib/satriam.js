const axios = require('axios');
const BASE = 'https://satriam.satriadeveloperz.workers.dev'; const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const client = axios.create({ baseURL: BASE, timeout: 15000, headers: { 'User-Agent': UA, 'Content-Type': 'application/json', 'Accept': 'application/json, text/plain, */*' } });

async function sendLink(email) {
    if (!email) throw new Error('Email wajib diisi');
    const r = await client.post('/api/satriam/send-link', { email: email.trim() });
    return { Creator: 'AlcaW44', Saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', status: r.data?.success ?? true, email: r.data?.email || email.trim(), message: r.data?.message || 'Magic link terkirim.' };
}
module.exports = { sendLink };