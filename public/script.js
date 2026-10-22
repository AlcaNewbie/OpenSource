/* =========================================================
   All Fitur - Frontend
   Credits: AlcaW44
   ========================================================= */

/* ---------- ANTI F12 / DEVTOOLS (Debugger Stop) ---------- */
(function antiDevtools() {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  // 1. Disable right click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Block key shortcuts
  document.addEventListener('keydown', (e) => {
    const k = e.key ? e.key.toUpperCase() : '';
    // F12
    if (k === 'F12') { e.preventDefault(); triggerTrap(); return false; }
    // Ctrl+Shift+I / J / C / K
    if (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(k)) {
      e.preventDefault(); triggerTrap(); return false;
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && k === 'U') { e.preventDefault(); return false; }
    // Ctrl+S
    if (e.ctrlKey && k === 'S') { e.preventDefault(); return false; }
    // Cmd+Option+I (mac)
    if (e.metaKey && e.altKey && k === 'I') { e.preventDefault(); triggerTrap(); return false; }
    // Cmd+Option+U
    if (e.metaKey && e.altKey && k === 'U') { e.preventDefault(); return false; }
  }, true);

  // 3. Debugger trap loop (stops execution when devtools open)
  function trap() {
    const start = performance.now();
    // debugger statement only pauses when devtools is open
    // eslint-disable-next-line no-debugger
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      // DevTools detected — take action
      blockContent();
    }
    setTimeout(trap, 500);
  }

  function triggerTrap() {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  function blockContent() {
    if (document.body.dataset.blocked === '1') return;
    document.body.dataset.blocked = '1';
    document.documentElement.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;
                  height:100vh;background:#0a0a0a;color:#f5f5f5;
                  font-family:system-ui;flex-direction:column;gap:12px;text-align:center;padding:20px;">
        <div style="font-size:20px;font-weight:700;">Akses Ditolak</div>
        <div style="font-size:13px;color:#8a8a8a;max-width:340px;">
          Developer tools terdeteksi. Tutup DevTools untuk melanjutkan.
        </div>
      </div>`;
    // Force stop by throwing in loop
    (function halt() {
      try { (function(){}.constructor('debugger')()); } catch(e){}
      setTimeout(halt, 100);
    })();
  }

  // 4. DevTools detection via window size (desktop)
  if (!isMobile) {
    let threshold = 160;
    const check = () => {
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        triggerTrap();
      }
    };
    setInterval(check, 800);
  }

  // 5. DevTools detection via console timing (universal)
  const el = new Image();
  Object.defineProperty(el, 'id', {
    get() {
      triggerTrap();
      return '';
    }
  });
  // Trigger on console.log(el) — only runs if devtools console used
  setInterval(() => {
    console.log(el);
  }, 1500);

  // 6. Disable text selection (extra)
  document.addEventListener('selectstart', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  // 7. Start main trap loop
  setTimeout(trap, 1000);
})();

/* ---------- ROUTER & UI ---------- */
const views = {
  'bypass-sfl': {
    crumb: 'Bypass / SFL',
    title: 'SFL Link Bypasser',
    desc: 'Bypass shortlink sfl.gl menjadi link tujuan.',
    fields: [{ name: 'url', label: 'URL SFL', type: 'text', placeholder: 'https://sfl.gl/xxxxx' }],
    endpoint: '/api/bypass/sfl'
  },
  'bypass-bicolink': {
    crumb: 'Bypass / Bicolink',
    title: 'Bicolink Bypasser',
    desc: 'Bypass bicolink.com (headless browser).',
    fields: [{ name: 'url', label: 'URL Bicolink', type: 'text', placeholder: 'https://bicolink.com/xxxxx' }],
    endpoint: '/api/bypass/bicolink'
  },
  'bypass-khadavvi': {
    crumb: 'Bypass / Khadavvi',
    title: 'Khadavvi Safelink',
    desc: 'Bypass safelink khaddavi.net.',
    fields: [{ name: 'url', label: 'URL Khadavvi', type: 'text', placeholder: 'https://app.khaddavi.net/?an=...' }],
    endpoint: '/api/bypass/khadavvi'
  },
  'bypass-adlinksumo': {
    crumb: 'Bypass / AdLinkSumo',
    title: 'AdLinkSumo Bypasser',
    desc: 'Bypass adlinksumo.com.',
    fields: [{ name: 'url', label: 'URL AdLinkSumo', type: 'text', placeholder: 'https://adlinksumo.com/xxxxx' }],
    endpoint: '/api/bypass/adlinksumo'
  },
  'bypass-vplink': {
    crumb: 'Bypass / VPLink',
    title: 'VPLink Bypasser',
    desc: 'Bypass vplink.in (headless browser).',
    fields: [{ name: 'url', label: 'URL VPLink', type: 'text', placeholder: 'https://vplink.in/xxxxx' }],
    endpoint: '/api/bypass/vplink'
  },
  'image-upscale': {
    crumb: 'Image / Upscale',
    title: 'AI Image Upscale',
    desc: 'Upscale gambar via Wink AI. Mode: hd / ultra / uhd ai',
    fields: [
      { name: 'url', label: 'URL Gambar', type: 'text', placeholder: 'https://...' },
      { name: 'mode', label: 'Mode', type: 'select', options: ['hd','ultra','uhd ai'] }
    ],
    endpoint: '/api/image/upscale'
  },
  'image-t2i': {
    crumb: 'Image / Text to Image',
    title: 'Text to Image',
    desc: 'Generate gambar dari prompt AI.',
    fields: [
      { name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'a cat wearing sunglasses, cyberpunk...' },
      { name: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['1:1','16:9','9:16','4:3','3:4'] }
    ],
    endpoint: '/api/image/text2image'
  },
  'dl-aio': {
    crumb: 'Download / All In One',
    title: 'All In One Downloader',
    desc: 'Download video dari berbagai platform (TikTok, IG, YT, dll).',
    fields: [{ name: 'url', label: 'URL Video', type: 'text', placeholder: 'https://www.tiktok.com/...' }],
    endpoint: '/api/download/aio'
  },
  'create-amprem': {
    crumb: 'Create / Am Prem',
    title: 'Alight Motion Premium',
    desc: 'Kirim magic link Alight Motion Premium ke email.',
    fields: [{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@mail.com' }],
    endpoint: '/api/create/amprem'
  },
  'create-netflix': {
    crumb: 'Create / Netflix Generate',
    title: 'Netflix Token Generator',
    desc: 'Generate token Netflix aktif.',
    fields: [{ name: 'count', label: 'Jumlah Token', type: 'number', value: 1 }],
    endpoint: '/api/create/netflix'
  }
};

const contentEl = document.getElementById('content');
const crumbEl = document.getElementById('crumb');
const navItems = document.querySelectorAll('.nav-item');
const sidebar = document.querySelector('.sidebar');
const menuBtn = document.getElementById('menuBtn');

function renderView(key) {
  const v = views[key];
  if (!v) return;
  crumbEl.textContent = v.crumb;

  const fieldsHtml = v.fields.map(f => {
    if (f.type === 'select') {
      const opts = (f.options || []).map(o => `<option value="${o}">${o}</option>`).join('');
      return `<div class="field"><label>${f.label}</label><select name="${f.name}">${opts}</select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="field"><label>${f.label}</label><textarea name="${f.name}" placeholder="${f.placeholder||''}"></textarea></div>`;
    }
    return `<div class="field"><label>${f.label}</label><input type="${f.type}" name="${f.name}" placeholder="${f.placeholder||''}" value="${f.value||''}" /></div>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="view">
      <h1>${v.title}</h1>
      <p class="desc">${v.desc}</p>
      <form id="theForm">
        ${fieldsHtml}
        <button class="btn" type="submit" id="submitBtn">Proses</button>
      </form>
      <div class="result" id="result">Menunggu input…</div>
    </div>
  `;

  document.getElementById('theForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('submitBtn');
    const out = document.getElementById('result');

    const payload = {};
    new FormData(form).forEach((val, key) => { payload[key] = val; });

    btn.disabled = true;
    btn.textContent = 'Memproses…';
    out.className = 'result';
    out.textContent = '⏳ Sedang diproses…';

    try {
      const res = await fetch(v.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      out.className = 'result ok';
      out.textContent = JSON.stringify(data, null, 2);

      // If image result
      const imgUrl = data?.image_url || data?.data?.url || data?.result?.url;
      if (imgUrl && /^https?:\/\//.test(imgUrl)) {
        const img = document.createElement('img');
        img.src = imgUrl;
        out.appendChild(img);
      }
    } catch (err) {
      out.className = 'result err';
      out.textContent = '❌ Error: ' + err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Proses';
    }
  });
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    renderView(item.dataset.view);
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  });
});

menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));

// default view
document.querySelector('[data-view="bypass-sfl"]').classList.add('active');
renderView('bypass-sfl');

// online status
function setOnline() {
  const el = document.getElementById('netStatus');
  el.textContent = navigator.onLine ? 'online' : 'offline';
  el.className = 'status' + (navigator.onLine ? '' : ' off');
}
window.addEventListener('online', setOnline);
window.addEventListener('offline', setOnline);
setOnline();
