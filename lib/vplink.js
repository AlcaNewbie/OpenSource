const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bypassVplinkPuppeteer(url, options = {}) {
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs || 45000;
    let cleanUrl = url.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = 'https://' + cleanUrl;
    const slug = cleanUrl.split('/').pop() || '';
    if (!slug) return { success: false, original_url: url, error: 'Invalid shortlink URL: slug not found.', execution_time_ms: 0 };

    let browser;
    try {
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
        const headers = { 'User-Agent': userAgent, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' };
        const jar = {};
        const saveCookies = (res) => { const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : []; for (const c of raw) { const parts = c.split(';')[0].split('='); if (parts.length >= 2) jar[parts[0].trim()] = parts.slice(1).join('=').trim(); } };

        const r1 = await fetch(cleanUrl, { headers }); saveCookies(r1);
        const r2 = await fetch(`https://jobskiki.in/studyeducates/studyuniversitiess/?studyinsurance=${slug}`, { headers: { ...headers, Referer: 'https://sarkarijobcorner.com/educatestudy/learn_more.php' } }); saveCookies(r2);
        const jobText = await r2.text(); const m = jobText.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
        const jobArt = m ? m[1].replace(/\\\//g, '/') : 'https://jobskiki.in/studyeducates/';
        await fetch('https://jobskiki.in/studyeducates/learn_more.php', { headers: { ...headers, Referer: jobArt, Cookie: `PHPSESSID=${jar['PHPSESSID'] || ''}; _uocat=value` } });
        jar['ab'] = '2';

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setUserAgent(userAgent);
        page.setDefaultNavigationTimeout(timeoutMs);
        const cookiesToSet = Object.entries(jar).map(([name, value]) => ({ name, value, domain: 'vplink.in', path: '/' }));
        await page.setCookie(...cookiesToSet);

        let bypassedUrl = null;
        page.on('response', async (response) => {
            if (response.url().includes('/links/go')) {
                try { const data = await response.json(); if (data && data.url && data.url !== '#') bypassedUrl = data.url; } catch (_) {}
            }
        });

        await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', referer: 'https://jobskiki.in/studyeducates/learn_more.php' });

        if (!bypassedUrl) {
            bypassedUrl = await page.evaluate(() => {
                const ogU = document.querySelector('meta[property="og:url"], meta[name="og:url"]');
                if (ogU && ogU.getAttribute('content')?.startsWith('http')) return ogU.getAttribute('content');
                const ogI = document.querySelector('meta[property="og:image"], meta[name="og:image"]');
                if (ogI && ogI.getAttribute('content')?.startsWith('http')) { try { return new URL(ogI.getAttribute('content') || '').origin; } catch (_) {} }
                return null;
            });
        }

        if (!bypassedUrl) {
            const maxWaitTime = Date.now() + 15000;
            while (!bypassedUrl && Date.now() < maxWaitTime) {
                const hasForm = await page.$('#go-link');
                if (hasForm) { await page.evaluate(() => { const form = document.querySelector('#go-link'); if (form) { const btn = form.querySelector('button, input[type=submit]'); if (btn) btn.click(); else form.submit(); } }); }
                await delay(1000);
            }
        }

        if (!bypassedUrl) throw new Error('Unable to extract destination URL via Puppeteer.');
        return { success: true, original_url: url, bypassed_url: bypassedUrl, execution_time_ms: Date.now() - startTime };
    } catch (err) {
        return { success: false, original_url: url, error: err?.message || String(err), execution_time_ms: Date.now() - startTime };
    } finally { if (browser) { try { await browser.close(); } catch (_) {} } }
}
module.exports = { bypassVplink: bypassVplinkPuppeteer, bypassVplinkPuppeteer };