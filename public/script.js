window.enterApp = function() {
  const welcome = document.getElementById("welcomeScreen");
  const app = document.getElementById("mainApp");
  welcome.style.opacity = "0";
  setTimeout(() => {
    welcome.style.display = "none";
    app.style.display = "flex";
  }, 300);
};

/* ================= ANTI DEVTOOLS ================= */
(function() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    const k = e.key ? e.key.toUpperCase() : '';
    if (k === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(k)) || (e.ctrlKey && k === 'U')) {
      e.preventDefault(); debugger;
    }
  }, true);
  setInterval(() => {
    const start = performance.now(); debugger;
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
  'bypass-adsafe': { crumb: 'Bypass / AdSafe', title: 'AdSafe Bypasser', desc: 'Bypass adsafelink.', fields: [{ name: 'url', label: 'URL AdSafe', type: 'text', placeholder: 'https://link.adsafelink.com/...' }], endpoint: '/api/bypass/adsafe' },
  'bypass-biplab': { crumb: 'Bypass / Biplab', title: 'Biplab Bypasser', desc: 'Bypass biplab.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/biplab' },
  'bypass-cutwin': { crumb: 'Bypass / CutWin', title: 'CutWin Bypasser', desc: 'Bypass cutwin.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/cutwin' },
  'bypass-delta': { crumb: 'Bypass / Delta', title: 'Delta Bypasser', desc: 'Bypass delta.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/delta' },
  'bypass-droplink': { crumb: 'Bypass / Droplink', title: 'Droplink Bypasser', desc: 'Bypass droplink.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/droplink' },
  'bypass-earnlinks': { crumb: 'Bypass / EarnLinks', title: 'EarnLinks Bypasser', desc: 'Bypass earnlinks.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/earnlinks' },
  'bypass-izen': { crumb: 'Bypass / Izen', title: 'Izen Bypasser', desc: 'Bypass izen.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/izen' },
  'bypass-linkpays': { crumb: 'Bypass / LinkPays', title: 'LinkPays Bypasser', desc: 'Bypass linkpays.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/linkpays' },
  'bypass-linkpoi': { crumb: 'Bypass / LinkPoi', title: 'LinkPoi Bypasser', desc: 'Bypass linkpoi.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/linkpoi' },
  'bypass-linkvertise': { crumb: 'Bypass / Linkvertise', title: 'Linkvertise Bypasser', desc: 'Bypass linkvertise.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/linkvertise' },
  'bypass-moneyblink': { crumb: 'Bypass / MoneyBlink', title: 'MoneyBlink Bypasser', desc: 'Bypass moneyblink.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/moneyblink' },
  'bypass-move2link': { crumb: 'Bypass / Move2Link', title: 'Move2Link Bypasser', desc: 'Bypass move2link.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/move2link' },
  'bypass-ouo': { crumb: 'Bypass / Ouo', title: 'Ouo Bypasser', desc: 'Bypass ouo.io / ouo.press.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/ouo' },
  'bypass-pndk': { crumb: 'Bypass / Pndk', title: 'Pndk Bypasser', desc: 'Bypass pndk.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/pndk' },
  'bypass-recaptcha': { crumb: 'Bypass / reCAPTCHA', title: 'reCAPTCHA Solver', desc: 'Solve reCAPTCHA V3.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }, { name: 'sitekey', label: 'SiteKey', type: 'text', placeholder: '6Lc...' }], endpoint: '/api/bypass/recaptcha' },
  'bypass-shrinkme': { crumb: 'Bypass / Shrinkme', title: 'Shrinkme Bypasser', desc: 'Bypass shrinkme.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/shrinkme' },
  'bypass-sub2unlock': { crumb: 'Bypass / Sub2Unlock', title: 'Sub2Unlock Bypasser', desc: 'Bypass sub2unlock.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/sub2unlock' },
  'bypass-sub4unlock': { crumb: 'Bypass / Sub4Unlock', title: 'Sub4Unlock Bypasser', desc: 'Bypass sub4unlock.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/sub4unlock' },
  'bypass-tpi': { crumb: 'Bypass / TPI', title: 'TPI Bypasser', desc: 'Token Base64 Bypass.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/tpi' },
  'bypass-universal': { crumb: 'Bypass / Universal', title: 'Universal Bypasser', desc: 'Universal Bypass.', fields: [{ name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' }], endpoint: '/api/bypass/universal' },
  'image-upscale': { crumb: 'Image / Upscale', title: 'AI Image Upscale', desc: 'Upscale gambar via Rezolve.', fields: [{ name: 'url', label: 'URL Gambar', type: 'text', placeholder: 'https://...' }, { name: 'multiplier', label: 'Multiplier', type: 'select', options: ['2','4'] }], endpoint: '/api/image/upscale' },
  'image-t2i': { crumb: 'Image / Text to Image', title: 'Text to Image', desc: 'Generate gambar dari prompt.', fields: [{ name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'kucing...' }, { name: 'aspectRatio', label: 'Ratio', type: 'select', options: ['1:1','16:9','9:16','4:3','3:4'] }], endpoint: '/api/image/text2image' },
  'image-removebg': { crumb: 'Image / Remove BG', title: 'Remove Background', desc: 'Hapus background gambar.', fields: [{ name: 'url', label: 'URL Gambar', type: 'text', placeholder: 'https://...' }], endpoint: '/api/image/removebg' },
  'dl-aio': { crumb: 'Download / AIO', title: 'All In One Downloader', desc: 'Download video sosmed.', fields: [{ name: 'url', label: 'URL Video', type: 'text', placeholder: 'https://tiktok.com/...' }], endpoint: '/api/download/aio' },
  'create-amprem': { crumb: 'Create / Am Prem', title: 'Alight Motion Premium', desc: 'Dapatkan akses premium Alight Motion secara gratis.', fields: [], endpoint: '/api/create/amprem' },
  'create-netflix': { crumb: 'Create / Netflix', title: 'Netflix Generator', desc: 'Generate token Netflix aktif.', fields: [{ name: 'count', label: 'Jumlah Token', type: 'number', value: 1 }], endpoint: '/api/create/netflix' }
};

const contentEl = document.getElementById('content');
const crumbEl = document.getElementById('crumb');
const navItems = document.querySelectorAll('.nav-item');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');

function renderView(key) {
  const v = views[key];
  if (!v) return;
  crumbEl.textContent = v.crumb;

  if (key === 'create-amprem') {
    contentEl.innerHTML = `
      <div class="view">
        <h1>${v.title}</h1><p class="desc">${v.desc}</p>
        
        <div class="amprem-container" style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); padding:20px;">
          <div class="amprem-group">
            <label style="display:block; font-size:13px; color:var(--text-dim); margin-bottom:8px;">Stage 1 — Email Alight Motion:</label>
            <input type="email" id="amEmail1" placeholder="email@domain.com" style="width:100%; background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:12px; color:var(--text); outline:none; margin-bottom:10px;" />
            <button class="btn" style="width:100%; margin-top:5px;" onclick="processAmPrem('1')">[1/2] kirim magic link</button>
          </div>

          <div class="amprem-group" style="border-top: 1px solid var(--border); padding-top: 20px; margin-top: 20px;">
            <label style="display:block; font-size:13px; color:var(--text-dim); margin-bottom:8px;">Stage 2 — Email Alight Motion:</label>
            <input type="email" id="amEmail2" placeholder="email@domain.com" style="width:100%; background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:12px; color:var(--text); outline:none; margin-bottom:10px;" />
            
            <label style="display:block; font-size:13px; color:var(--text-dim); margin-bottom:8px; margin-top:15px;">Stage 2 — Paste Magic Link (Firebase):</label>
            <input type="text" id="amLink" placeholder="https://alight-creative.firebaseapp.com/..." style="width:100%; background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:12px; color:var(--text); outline:none; margin-bottom:10px;" />
            
            <button class="btn" style="width:100%; margin-top:5px;" onclick="processAmPrem('2')">[2/2] verifikasi & aktifkan premium</button>
          </div>

          <a href="https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44" target="_blank" class="btn" style="width:100%; margin-top:20px; text-align:center; display:block; text-decoration:none; background:transparent; border:1px solid var(--accent); color:var(--accent);">JOIN OUR CHANNEL</a>
        </div>

        <div class="result" id="result" style="display:none; margin-top:20px;">
          <div class="result-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:10px;">
             <span>Response JSON:</span>
             <div style="display:flex; gap:10px;">
               <button onclick="copyJson()" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:12px;">copy json</button>
               <button onclick="downloadJson()" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:12px;">download .json</button>
             </div>
          </div>
          <pre id="jsonResult" style="user-select:text; white-space:pre-wrap; word-break:break-all;"></pre>
        </div>
      </div>
    `;
    return;
  }

  const fieldsHtml = v.fields.map(f => {
    if (f.type === 'select') return `<div class="field"><label>${f.label}</label><select name="${f.name}">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>`;
    if (f.type === 'textarea') return `<div class="field"><label>${f.label}</label><textarea name="${f.name}" placeholder="${f.placeholder||''}"></textarea></div>`;
    return `<div class="field"><label>${f.label}</label><input type="${f.type}" name="${f.name}" placeholder="${f.placeholder||''}" value="${f.value||''}" /></div>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="view">
      <h1>${v.title}</h1><p class="desc">${v.desc}</p>
      <form id="theForm">${fieldsHtml}<button class="btn" type="submit" id="submitBtn">Proses</button></form>
      
      <div class="result" id="result" style="display:none;">
        <div class="result-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:10px;">
           <span>Response JSON:</span>
           <div style="display:flex; gap:10px;">
             <button onclick="copyJson()" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:12px;">copy json</button>
             <button onclick="downloadJson()" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:12px;">download .json</button>
           </div>
        </div>
        <pre id="jsonResult" style="user-select:text; white-space:pre-wrap; word-break:break-all; color:#4ade80; font-size:12px;"></pre>
        <div id="imageContainer"></div>
      </div>
    </div>`;

  document.getElementById('theForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const out = document.getElementById('result');
    const payload = {};
    new FormData(e.target).forEach((val, key) => payload[key] = val);

    btn.disabled = true; btn.textContent = 'Memproses…';
    out.style.display = 'block'; document.getElementById('jsonResult').textContent = '⏳ Sedang diproses…';
    document.getElementById('imageContainer').innerHTML = '';

    try {
      const res = await fetch(v.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      
      window.currentJsonData = data;
      document.getElementById('jsonResult').textContent = JSON.stringify(data, null, 2);
      
      const imgUrl = data?.image_url || data?.data?.url || data?.result?.url || data?.result?.image_url || (data?.image && data.image.startsWith('data:image') ? data.image : null);
      if (imgUrl) {
        const img = document.createElement('img'); img.src = imgUrl; img.style.maxWidth = '100%'; img.style.marginTop = '10px'; img.style.borderRadius = '8px';
        document.getElementById('imageContainer').appendChild(img);
      }
    } catch (err) {
      document.getElementById('jsonResult').textContent = '❌ Error: ' + err.message;
      document.getElementById('jsonResult').style.color = '#f87171';
    } finally {
      btn.disabled = false; btn.textContent = 'Proses';
    }
  });
}

/* ================= GLOBAL FUNCTIONS ================= */
window.copyJson = function() {
  if (!window.currentJsonData) return;
  navigator.clipboard.writeText(JSON.stringify(window.currentJsonData, null, 2)).then(() => alert('JSON berhasil dicopy!'));
};

window.downloadJson = function() {
  if (!window.currentJsonData) return;
  const blob = new Blob([JSON.stringify(window.currentJsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'result.json'; a.click();
  URL.revokeObjectURL(url);
};

window.processAmPrem = async function(stage) {
  const email = stage === '1' ? document.getElementById('amEmail1').value : document.getElementById('amEmail2').value;
  const magicLink = stage === '2' ? document.getElementById('amLink').value : '';
  const out = document.getElementById('result');
  const pre = document.getElementById('jsonResult');
  
  if (!email) return alert('Email wajib diisi!');
  if (stage === '2' && !magicLink) return alert('Magic link wajib diisi!');

  out.style.display = 'block';
  pre.textContent = '⏳ Sedang memproses...';
  pre.style.color = '#4ade80';

  try {
    const res = await fetch('/api/create/amprem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage, email, magicLink }) });
    const data = await res.json();
    window.currentJsonData = data;
    pre.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    pre.textContent = '❌ Error: ' + err.message;
    pre.style.color = '#f87171';
  }
};

/* ================= MENU & NAVIGATION ================= */
document.querySelectorAll('.nav-title').forEach(title => {
  title.addEventListener('click', () => title.parentElement.classList.toggle('open'));
});

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    renderView(item.dataset.view);
    if (window.innerWidth <= 768) sidebar.classList.remove('open'); // Tutup di mobile
  });
});

// Logika Slide Buka/Tutup Sidebar
let isSidebarOpen = true;

menuBtn.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    // Mode Mobile
    sidebar.classList.toggle('open');
  } else {
    // Mode Desktop (Slide keluar masuk)
    isSidebarOpen = !isSidebarOpen;
    if (isSidebarOpen) {
      sidebar.classList.remove('collapsed');
    } else {
      sidebar.classList.add('collapsed');
    }
  }
});

document.querySelector('.nav-group').classList.add('open');
document.querySelector('[data-view="bypass-sfl"]').classList.add('active');
renderView('bypass-sfl');
