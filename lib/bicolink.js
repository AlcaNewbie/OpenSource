const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

function jawabanCadangan(nonce) { let sum = 0; for (let i = 0; i < nonce.length; i++) { sum = (sum * 31 + nonce.charCodeAt(i) + i) % 1000000007; } return sum.toString(36); }
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bypassBicolinkPuppeteer(url, options = {}) {
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs || 45000;
    const cleanUrl = url.replace(/\/+$/, '');
    const slug = cleanUrl.split('/').pop() || '';
    if (!slug) return { success: false, original_url: url, error: 'Invalid shortlink URL: slug not found.', execution_time_ms: 0 };

    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        page.setDefaultNavigationTimeout(timeoutMs);

        let bypassedUrl = null;
        page.on('response', async (res) => {
            if (res.url().includes('/links/go')) {
                try { const data = await res.json(); if (data && data.url) bypassedUrl = data.url; } catch (_) {}
            }
        });

        await page.goto(cleanUrl, { waitUntil: 'networkidle2' });
        const freeUrl = `https://bicolink.com/al/free/${slug}`;
        await page.goto(freeUrl, { waitUntil: 'networkidle2', referer: page.url() });

        const html = await page.content();
        const nonceMatch = html.match(/var\s+nonce\s*=\s*["']([^"']+)["']/);
        if (nonceMatch) {
            const ans = jawabanCadangan(nonceMatch[1]);
            await page.evaluate(async (ans, slug) => {
                const fd = new FormData(); fd.append('nt_fb', ans); fd.append('nt_dari', 'tantangan');
                await fetch(`/al/verify/${slug}`, { method: 'POST', body: fd, credentials: 'same-origin' });
            }, ans, slug);
            await page.goto(freeUrl, { waitUntil: 'networkidle2' });
        }

        try {
            await page.waitForSelector('#wpsafe-link a', { timeout: 15000 });
            const href = await page.$eval('#wpsafe-link a', (el) => el.href);
            if (href) await page.goto(href, { waitUntil: 'networkidle2' });
        } catch (_) {}

        const maxWaitTime = Date.now() + 25000;
        while (!bypassedUrl && Date.now() < maxWaitTime) {
            const hasGoForm = await page.$('#go-link');
            if (hasGoForm) {
                await delay(5500);
                await page.evaluate(() => { const form = document.querySelector('#go-link'); if (form) { const btn = form.querySelector('button, input[type=submit], a'); if (btn) btn.click(); else form.submit(); } });
                await delay(3000);
                if (bypassedUrl) break;
            }
            const hasSafeLink = await page.$('#wpsafe-link a');
            if (hasSafeLink) {
                const nextHref = await page.$eval('#wpsafe-link a', (el) => el.href);
                if (nextHref && nextHref !== page.url()) { await page.goto(nextHref, { waitUntil: 'networkidle2' }); continue; }
            }
            await delay(1000);
        }

        if (!bypassedUrl) throw new Error('Unable to extract destination URL via Puppeteer.');
        return { success: true, original_url: url, bypassed_url: bypassedUrl, execution_time_ms: Date.now() - startTime };
    } catch (e) {
        return { success: false, original_url: url, error: e.message || 'Unknown error', execution_time_ms: Date.now() - startTime };
    } finally { if (browser) { try { await browser.close(); } catch (_) {} } }
}
module.exports = { bypassBicolink: bypassBicolinkPuppeteer, bypassBicolinkPuppeteer };