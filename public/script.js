/* ================= ANTI DEVTOOLS (DEBUGGER TRAP) ================= */
(function() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    const k = e.key ? e.key.toUpperCase() : '';
    if (k === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(k)) || (e.ctrlKey && k === 'U')) {
      e.preventDefault();
      debugger;
    }
  }, true);
  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#f5f5f5;font-family:sans-serif;text-align:center;"><h2>Akses Ditolak.<br>Tutup Developer Tools.</h2></div>';
      window.location.reload();
    }
  }, 1000);
})();

/* ================= ROUTER UI ================= */
const views = {
  'bypass-sfl': { crumb: 'Bypass / SFL', title: 'SFL Link Bypasser', desc: 'Bypass shortlink sfl.gl.', fields: [{ name: 'url', label: 'URL SFL', type: 'text', placeholder: 'https://sfl.gl/...' }], endpoint: '/api/bypass/sfl' },
  'bypass-bicolink': { crumb: 'Bypass / Bicolink', title: 'Bicolink Bypasser', desc: 'Bypass bicolink.com.', fields: [{ name: 'url', label: 'URL Bicolink', type: 'text', placeholder: 'https://bicolink.com/...' }], endpoint: '/api/bypass/bicolink' },
  'bypass-khadavvi': { crumb: 'Bypass / Khadavvi', title: 'Khadavvi Safelink', desc: 'Bypass safelink khaddavi.', fields: [{ name: 'url', label: 'URL Khadavvi', type: 'text', placeholder: 'https://app.khaddavi.net/?an=...' }], endpoint: '/api/bypass/khadavvi' },
  'bypass-adlinksumo': { crumb: 'Bypass / AdLinkSumo', title: 'AdLinkSumo Bypasser', desc: 'Bypass adlinksumo.com.', fields: [{ name: 'url', label: 'URL AdLinkSumo', type: 'text', placeholder: 'https://adlinksumo.com/...' }], endpoint: '/api/bypass/adlinksumo' },
  'bypass-vplink': { crumb: 'Bypass / VPLink', title: 'VPLink Bypasser', desc: 'Bypass vplink.in.', fields: [{ name: 'url', label: 'URL VPLink', type: 'text', placeholder: 'https://vplink.in/...' }], endpoint: '/api/bypass/vplink' },
  'image-upscale': { crumb: 'Image / Upscale', title: 'AI Image Upscale', desc: 'Upscale gambar via Wink AI.', fields: [{ name: 'url', label: 'URL Gambar', type: 'text', placeholder: 'https://...' }, { name: 'mode', label: 'Mode', type: 'select', options: ['hd','ultra','uhd ai'] }], endpoint: '/api/image/upscale' },
  'image-t2i': { crumb: 'Image / Text to Image', title: 'Text to Image', desc: 'Generate gambar dari prompt.', fields: [{ name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'kucing...' }, { name: 'aspectRatio', label: 'Ratio', type: 'select', options: ['1:1','16:9','9:16','4:3','3:4'] }], endpoint: '/api/image/text2image' },
  'dl-aio': { crumb: 'Download / AIO', title: 'All In One Downloader', desc: 'Download video sosmed.', fields: [{ name: 'url', label: 'URL Video', type: 'text', placeholder: 'https://tiktok.com/...' }], endpoint: '/api/download/aio' },
  'create-amprem': { crumb: 'Create / Am Prem', title: 'Alight Motion Premium', desc: 'Kirim magic link ke email.', fields: [{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@mail.com' }], endpoint: '/api/create/amprem' },
  'create-netflix': { crumb: 'Create / Netflix', title: 'Netflix Generator', desc: 'Generate token Netflix.', fields: [{ name: 'count', label: 'Jumlah', type: 'number', value: 1 }], endpoint: '/api/create/netflix' }
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
    if (f.type === 'select') return `<div class="field"><label>${f.label}</label><select name="${f.name}">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>`;
    if (f.type === 'textarea') return `<div class="field"><label>${f.label}</label><textarea name="${f.name}" placeholder="${f.placeholder||''}"></textarea></div>`;
    return `<div class="field"><label>${f.label}</label><input type="${f.type}" name="${f.name}" placeholder="${f.placeholder||''}" value="${f.value||''}" /></div>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="view">
      <h1>${v.title}</h1><p class="desc">${v.desc}</p>
      <form id="theForm">${fieldsHtml}<button class="btn" type="submit" id="submitBtn">Proses</button></form>
      <div class="result" id="result">Menunggu input…</div>
    </div>`;

  document.getElementById('theForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const out = document.getElementById('result');
    const payload = {};
    new FormData(e.target).forEach((val, key) => payload[key] = val);

    btn.disabled = true; btn.textContent = 'Memproses…';
    out.className = 'result'; out.textContent = '⏳ Sedang diproses…';

    try {
      const res = await fetch(v.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      out.className = 'result ok';
      out.textContent = JSON.stringify(data, null, 2);
      const imgUrl = data?.image_url || data?.data?.url || data?.result?.url;
      if (imgUrl && /^https?:\/\//.test(imgUrl)) {
        const img = document.createElement('img'); img.src = imgUrl; out.appendChild(img);
      }
    } catch (err) {
      out.className = 'result err'; out.textContent = '❌ Error: ' + err.message;
    } finally {
      btn.disabled = false; btn.textContent = 'Proses';
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
document.querySelector('[data-view="bypass-sfl"]').classList.add('active');
renderView('bypass-sfl');