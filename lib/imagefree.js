const BASE_URL = 'https://imagefree.net'; const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function generate(prompt, options = {}) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) throw new Error('Prompt tidak boleh kosong');
    const cp = prompt.trim(); const ar = typeof options === 'string' ? options : (options.aspectRatio || '1:1');
    const g = await fetch(`${BASE_URL}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': UA, 'Referer': `${BASE_URL}/`, 'Origin': BASE_URL }, body: JSON.stringify({ prompt: cp, aspect_ratio: ar }) });
    const gj = await g.json().catch(() => ({})); if (gj.error || !gj.taskId) throw new Error(gj.error || 'Gagal mulai generate');
    const tid = gj.taskId, max = 30;
    for (let i = 0; i < max; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const s = await fetch(`${BASE_URL}/api/generate/status?taskId=${tid}`, { headers: { 'User-Agent': UA, 'Referer': `${BASE_URL}/` } });
        const sj = await s.json().catch(() => ({}));
        if (sj.error) throw new Error(sj.error);
        if (sj.status === 'completed' && sj.image) return { Creator: 'AlcaW44', Saluran: 'https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44', status: true, prompt: cp, aspect_ratio: ar, task_id: tid, image_url: sj.image };
        if (sj.status === 'failed') throw new Error('Gagal di server');
    }
    throw new Error('Timeout generate');
}
module.exports = { generate, extract: generate };