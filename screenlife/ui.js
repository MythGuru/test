/* TikTok Famous (screen-life): drawing kit for a phone screen, 1080 x 1920 logical pixels */
(function () {
  const SL = (window.SL = window.SL || {});
  const W = (SL.W = 1080), H = (SL.H = 1920);
  const UI = (SL.UI = {});
  const F_UI = "'Inter', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
  const F_CAP = "'Montserrat', 'Inter', Arial, sans-serif";
  UI.F_UI = F_UI; UI.F_CAP = F_CAP;

  // ---------------------------------------------------------------- math
  const U = (SL.U = {});
  U.c01 = v => Math.max(0, Math.min(1, v));
  U.lerp = (a, b, k) => a + (b - a) * k;
  U.range = (t, a, b) => U.c01((t - a) / (b - a));
  U.smooth = k => k * k * (3 - 2 * k);
  U.inOut = s => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
  U.out = s => 1 - Math.pow(1 - s, 3);
  U.out5 = s => 1 - Math.pow(1 - s, 5);
  U.back = s => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(s - 1, 3) + c1 * Math.pow(s - 1, 2); };
  U.elastic = s => (s <= 0 ? 0 : s >= 1 ? 1 : Math.pow(2, -10 * s) * Math.sin((s * 10 - 0.75) * (2 * Math.PI / 3)) + 1);
  U.hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  U.env = (t, a, b, fi = 0.2, fo = 0.2) => Math.min(U.range(t, a, a + fi), 1 - U.range(t, b - fo, b));
  U.fmt = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.0', '') + 'M' : n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace('.0', '') + 'K' : n.toLocaleString('en-US');

  // ---------------------------------------------------------------- primitives
  UI.rr = (c, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  UI.box = (c, x, y, w, h, r, fill, stroke, lw) => { UI.rr(c, x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); } };
  UI.text = (c, s, x, y, o = {}) => {
    c.font = `${o.weight || 600} ${o.size || 40}px ${o.font || F_UI}`;
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = o.blur || 18; c.shadowOffsetY = o.sy || 3; }
    if (o.stroke) { c.lineJoin = 'round'; c.lineWidth = o.lw || 10; c.strokeStyle = o.stroke; c.strokeText(s, x, y); }
    c.fillStyle = o.color || '#fff';
    if (o.maxW) c.fillText(s, x, y, o.maxW); else c.fillText(s, x, y);
    c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    return c.measureText(s).width;
  };
  UI.width = (c, s, size, weight = 600, font = F_UI) => { c.font = `${weight} ${size}px ${font}`; return c.measureText(s).width; };
  // wrap text into lines that fit maxW
  UI.wrap = (c, s, size, weight, maxW, font = F_UI) => {
    c.font = `${weight} ${size}px ${font}`;
    const words = s.split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    return lines;
  };

  // ---------------------------------------------------------------- icons (24-unit SVG paths)
  const P = {
    heart: 'M12 21s-7.5-4.6-10-9.2C.3 8.6 2.1 4.5 6 4.1c2.3-.2 4.1 1 6 3.2 1.9-2.2 3.7-3.4 6-3.2 3.9.4 5.7 4.5 4 7.7C19.5 16.4 12 21 12 21z',
    comment: 'M12 3C6.5 3 2 6.8 2 11.4c0 2.5 1.3 4.7 3.4 6.2L4.6 21l4.2-2.1c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.4S17.5 3 12 3z',
    share: 'M13.5 4.5v4C6.5 9.3 3.5 13.5 3 19.5c2.2-3.2 5.3-4.8 10.5-4.8v4.3L21 12l-7.5-7.5z',
    bookmark: 'M6 3h12a1 1 0 011 1v17l-7-4.5L5 21V4a1 1 0 011-1z',
    plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z',
    home: 'M3 11L12 3l9 8v10h-6v-6H9v6H3z',
    search: 'M10.5 3a7.5 7.5 0 015.9 12.1l4.8 4.8-1.4 1.4-4.8-4.8A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z',
    inbox: 'M3 5h18v14H3zM3 5l9 7 9-7',
    user: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm-8 9c0-4 3.6-7 8-7s8 3 8 7z',
    bell: 'M12 22a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 22zm7-6V11a7 7 0 00-5.5-6.8V3a1.5 1.5 0 00-3 0v1.2A7 7 0 005 11v5l-2 2v1h18v-1z',
    phone: 'M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1z',
    msg: 'M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2z',
    music: 'M9 18.5a3 3 0 11-2-2.8V5l12-2v12.5a3 3 0 11-2-2.8V7.4L9 8.7z',
    check: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
    lock: 'M7 10V7a5 5 0 0110 0v3h1a1 1 0 011 1v10a1 1 0 01-1 1H6a1 1 0 01-1-1V11a1 1 0 011-1zm2 0h6V7a3 3 0 00-6 0z',
    camera: 'M4 7h3l2-2.5h6L17 7h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1zm8 3a4 4 0 100 8 4 4 0 000-8z',
    star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z',
    sparkle: 'M12 1l2.2 7.8L22 11l-7.8 2.2L12 21l-2.2-7.8L2 11l7.8-2.2z',
    trash: 'M6 7h12l-1 14H7zM9 3h6l1 2h4v2H4V5h4z',
    gear: 'M12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM10.5 2h3l.5 2.6 2 .9 2.3-1.4 2.1 2.1-1.4 2.3.9 2 2.6.5v3l-2.6.5-.9 2 1.4 2.3-2.1 2.1-2.3-1.4-2 .9-.5 2.6h-3l-.5-2.6-2-.9-2.3 1.4-2.1-2.1 1.4-2.3-.9-2L2 13.5v-3l2.6-.5.9-2-1.4-2.3 2.1-2.1 2.3 1.4 2-.9z',
    verified: 'M12 1.5l2.6 2 3.2-.3 1 3.1 2.8 1.6-.9 3.1.9 3.1-2.8 1.6-1 3.1-3.2-.3-2.6 2-2.6-2-3.2.3-1-3.1L2.3 15l.9-3.1L2.3 8.9l2.8-1.6 1-3.1 3.2.3z',
    eye: 'M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7zm0 3.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
    play: 'M8 5v14l11-7z',
    battery: '',
  };
  const PATHS = {};
  for (const k in P) if (P[k]) PATHS[k] = new Path2D(P[k]);
  UI.icon = (c, name, x, y, size, color, opts = {}) => {
    c.save(); c.translate(x, y); c.scale(size / 24, size / 24);
    if (opts.shadow) { c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 8; c.shadowOffsetY = 1; }
    if (opts.stroke) { c.lineWidth = opts.stroke; c.strokeStyle = color; c.lineJoin = 'round'; c.stroke(PATHS[name]); }
    else { c.fillStyle = color; c.fill(PATHS[name]); }
    c.restore();
  };

  // ---------------------------------------------------------------- status bar
  // frosted glass: blur whatever is already drawn under the rectangle
  const gS = document.createElement('canvas'); gS.width = 120; gS.height = 120;
  UI.glass = (c, x, y, w, h, r, tint) => {
    const g = gS.getContext('2d'), k = 0.12, sw = Math.max(4, Math.round(w * k)), sh = Math.max(4, Math.round(h * k));
    gS.width = sw; gS.height = sh;
    g.imageSmoothingQuality = 'high';
    try { g.drawImage(c.canvas, x, y, w, h, 0, 0, sw, sh); } catch (e) {}
    c.save(); UI.rr(c, x, y, w, h, r); c.clip();
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(gS, 0, 0, sw, sh, x - 6, y - 6, w + 12, h + 12);
    c.fillStyle = tint || 'rgba(245,245,250,0.72)'; c.fillRect(x, y, w, h);
    c.restore();
  };
  // Dynamic Island with optional live activity: { kind: 'call'|'rec'|'timer', text }
  UI.island = (c, o = {}) => {
    const act = o.activity;
    const w = act ? 560 : 330, x = (W - w) / 2;
    UI.box(c, x, 30, w, 100, 50, '#000');
    if (!act) { c.beginPath(); c.arc(x + w - 62, 80, 14, 0, Math.PI * 2); c.fillStyle = '#0d0f1a'; c.fill(); return; }
    if (act.kind === 'call') { UI.box(c, x + 26, 52, 56, 56, 28, '#30d158'); UI.icon(c, 'phone', x + 38, 64, 32, '#fff'); UI.text(c, act.text, x + w - 40, 95, { size: 38, weight: 700, color: '#30d158', align: 'right' }); }
    if (act.kind === 'rec') { c.beginPath(); c.arc(x + 56, 80, 16, 0, Math.PI * 2); c.fillStyle = '#ff3b30'; c.fill(); UI.text(c, act.text, x + w - 40, 95, { size: 38, weight: 700, color: '#ff3b30', align: 'right' }); }
    if (act.kind === 'timer') { UI.icon(c, 'bell', x + 32, 56, 48, '#ff9f0a'); UI.text(c, act.text, x + w - 40, 95, { size: 38, weight: 700, color: '#ff9f0a', align: 'right' }); }
  };
  UI.homeBar = (c, dark) => UI.box(c, W / 2 - 140, H - 30, 280, 11, 6, dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)');

  UI.status = (c, o = {}) => {
    UI.island(c, o);
    const col = o.dark ? '#111' : '#fff';
    if (o.time !== '') UI.text(c, o.time || '9:41', 150, 96, { size: 46, weight: 700, color: col, align: 'center' });
    // signal bars
    for (let i = 0; i < 4; i++) { c.fillStyle = col; c.globalAlpha = o.noSignal && i > 0 ? 0.3 : 1; UI.rr(c, 790 + i * 15, 92 - (i + 1) * 9, 10, (i + 1) * 9, 2); c.fill(); }
    c.globalAlpha = 1;
    // wifi
    c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(884, 96, 10 + i * 10, -Math.PI * 0.78, -Math.PI * 0.22); c.stroke(); }
    // battery
    const lvl = o.battery === undefined ? 0.82 : o.battery;
    UI.box(c, 930, 64, 78, 38, 11, null, col, 3);
    c.globalAlpha = 0.5; UI.box(c, 1011, 75, 6, 16, 3, col); c.globalAlpha = 1;
    UI.box(c, 936, 70, Math.max(6, 66 * lvl), 26, 7, lvl < 0.2 ? '#ff3b30' : col);
    if (o.dnd) UI.text(c, '☾', 730, 82, { size: 38, color: '#a78bfa', align: 'center' });
  };

  // ---------------------------------------------------------------- avatars and "video" art (placeholders that real footage can replace)
  const PAL = [['#ff3d8b', '#7a2cff'], ['#00d4ff', '#2b5cff'], ['#ffb800', '#ff3d00'], ['#00e6a1', '#00796b'], ['#c56cff', '#ff6fb1'], ['#ff6b6b', '#ffd93d'], ['#4dd0ff', '#9b5cff']];
  UI.pal = i => PAL[((i % PAL.length) + PAL.length) % PAL.length];
  UI.avatar = (c, x, y, r, seed, ring) => {
    const [a, b] = UI.pal(seed);
    const g = c.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, a); g.addColorStop(1, b);
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = g; c.fill();
    c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.beginPath(); c.arc(x, y - r * 0.18, r * 0.36, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(x, y + r * 0.78, r * 0.68, r * 0.5, 0, 0, Math.PI * 2); c.fill();
    c.restore();
    if (ring) { c.beginPath(); c.arc(x, y, r + 5, 0, Math.PI * 2); c.strokeStyle = ring; c.lineWidth = 5; c.stroke(); }
  };
  // Footage slots: if a clip is registered under `slot`, draw it; otherwise draw stylised art.
  SL.footage = SL.footage || {};
  UI.video = (c, x, y, w, h, t, o = {}) => {
    const v = o.slot && SL.footage[o.slot];
    c.save(); UI.rr(c, x, y, w, h, o.r || 0); c.clip();
    if (v && v.readyState >= 2) {
      const vr = v.videoWidth / v.videoHeight, r = w / h;
      const dw = vr > r ? h * vr : w, dh = vr > r ? h : w / vr;
      c.drawImage(v, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      const [a, b] = UI.pal(o.seed || 0);
      const g = c.createLinearGradient(x, y, x + w * 0.6, y + h); g.addColorStop(0, a); g.addColorStop(1, b);
      c.fillStyle = g; c.fillRect(x, y, w, h);
      // soft moving light blobs, like an out-of-focus room
      for (let i = 0; i < 6; i++) {
        const s = (o.seed || 0) * 7 + i, px = x + w * (0.2 + 0.6 * U.hash(s)) + Math.sin(t * 0.7 + s) * w * 0.08, py = y + h * (0.15 + 0.7 * U.hash(s + 3)) + Math.cos(t * 0.6 + s) * h * 0.05;
        const rad = w * (0.18 + 0.25 * U.hash(s + 5));
        const rg = c.createRadialGradient(px, py, 0, px, py, rad); rg.addColorStop(0, 'rgba(255,255,255,0.32)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = rg; c.fillRect(x, y, w, h);
      }
      if (o.ringLight) {
        const cx = x + w / 2, cy = y + h * 0.36, rad = w * 0.3;
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = w * 0.045; c.shadowColor = '#fff'; c.shadowBlur = 40;
        c.beginPath(); c.arc(cx, cy, rad, 0, Math.PI * 2); c.stroke(); c.shadowBlur = 0;
      }
      if (o.label) {
        const lines = UI.wrap(c, o.label, w * 0.075, 800, w * 0.8, F_CAP);
        lines.forEach((ln, i) => {
          const ty = y + h * (o.labelY || 0.5) + (i - (lines.length - 1) / 2) * w * 0.095;
          const tw = UI.width(c, ln, w * 0.075, 800, F_CAP);
          UI.box(c, x + w / 2 - tw / 2 - w * 0.025, ty - w * 0.07, tw + w * 0.05, w * 0.09, w * 0.02, '#fff');
          UI.text(c, ln, x + w / 2, ty, { size: w * 0.075, weight: 800, font: F_CAP, color: '#111', align: 'center' });
        });
      }
    }
    if (o.vignette !== false) {
      const vg = c.createLinearGradient(0, y + h * 0.6, 0, y + h); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      c.fillStyle = vg; c.fillRect(x, y, w, h);
    }
    c.restore();
  };

  // ---------------------------------------------------------------- notification banner (glass card)
  UI.notif = (c, x, y, w, o) => {
    const h = o.h || 172;
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 34; c.shadowOffsetY = 12;
    UI.box(c, x, y, w, h, 44, 'rgba(0,0,0,0.01)');
    c.restore();
    if (o.bg) UI.box(c, x, y, w, h, 44, o.bg); else UI.glass(c, x, y, w, h, 44, 'rgba(242,242,247,0.78)');
    // app icon
    const [a, b] = UI.pal(o.seed || 0);
    const g = c.createLinearGradient(x + 30, y + 34, x + 120, y + 124); g.addColorStop(0, o.iconA || a); g.addColorStop(1, o.iconB || b);
    UI.box(c, x + 32, y + 36, 96, 96, 24, g);
    UI.icon(c, o.icon || 'heart', x + 50, y + 54, 60, '#fff');
    UI.text(c, o.title, x + 156, y + 76, { size: 38, weight: 700, color: '#111', maxW: w - 300 });
    UI.text(c, o.body, x + 156, y + 128, { size: 36, weight: 400, color: '#333', maxW: w - 190 });
    UI.text(c, o.when || 'now', x + w - 34, y + 76, { size: 30, weight: 500, color: '#888', align: 'right' });
  };

  // ---------------------------------------------------------------- feed post (full-screen vertical video with actions)
  UI.feedPost = (c, t, o) => {
    UI.video(c, 0, 0, W, H, t, { seed: o.seed, label: o.label, ringLight: o.ringLight, slot: o.slot, labelY: 0.3 });
    // top tabs
    UI.text(c, 'Following', 395, 180, { size: 40, weight: 600, color: 'rgba(255,255,255,0.7)', align: 'center', shadow: 'rgba(0,0,0,0.4)' });
    UI.text(c, 'For You', 640, 180, { size: 42, weight: 800, color: '#fff', align: 'center', shadow: 'rgba(0,0,0,0.4)' });
    UI.box(c, 605, 200, 70, 7, 4, '#fff');
    UI.icon(c, 'search', 960, 140, 56, '#fff', { shadow: 1 });
    // right action column
    const ax = 975;
    UI.avatar(c, ax, 980, 54, o.avatarSeed || 1, '#fff');
    UI.box(c, ax - 24, 1012, 48, 48, 24, '#ff2d55'); UI.icon(c, 'plus', ax - 18, 1018, 36, '#fff');
    const acts = [['heart', o.likes, o.liked ? '#ff2d55' : '#fff'], ['comment', o.comments, '#fff'], ['bookmark', o.saves, o.saved ? '#ffc400' : '#fff'], ['share', o.shares, '#fff']];
    acts.forEach(([ic, n, col], i) => {
      const y = 1130 + i * 170, pop = (o.pop && o.pop[ic]) || 0;
      const s = 88 * (1 + 0.45 * Math.sin(Math.PI * U.c01(pop)));
      UI.icon(c, ic, ax - s / 2, y - s / 2 + 10, s, col, { shadow: 1 });
      UI.text(c, typeof n === 'number' ? U.fmt(n) : (n || ''), ax, y + 86, { size: 32, weight: 700, color: '#fff', align: 'center', shadow: 'rgba(0,0,0,0.5)' });
    });
    // spinning record
    c.save(); c.translate(ax, 1810); c.rotate(t * 1.6);
    c.beginPath(); c.arc(0, 0, 50, 0, Math.PI * 2); c.fillStyle = '#222'; c.fill();
    UI.avatar(c, 0, 0, 24, o.avatarSeed || 1); c.restore();
    // caption block
    UI.text(c, o.user, 44, 1640, { size: 44, weight: 800, color: '#fff', shadow: 'rgba(0,0,0,0.5)' });
    if (o.verified) UI.icon(c, 'verified', 54 + UI.width(c, o.user, 44, 800), 1604, 44, '#20d5ec');
    const lines = UI.wrap(c, o.caption || '', 38, 500, 820);
    lines.slice(0, 2).forEach((ln, i) => UI.text(c, ln, 44, 1706 + i * 52, { size: 38, weight: 500, color: '#fff', shadow: 'rgba(0,0,0,0.5)' }));
    UI.icon(c, 'music', 44, 1790, 36, '#fff');
    UI.text(c, o.sound || 'original sound', 96, 1820, { size: 34, weight: 500, color: '#fff', shadow: 'rgba(0,0,0,0.5)' });
    // progress bar
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(0, H - 8, W, 8);
    c.fillStyle = '#fff'; c.fillRect(0, H - 8, W * ((o.progress === undefined ? (t * 0.07) % 1 : o.progress)), 8);
  };

  // ---------------------------------------------------------------- chat bubbles
  UI.bubble = (c, x, y, s, mine, o = {}) => {
    const size = o.size || 42, padX = 38, maxW = 700;
    const lines = UI.wrap(c, s, size, 500, maxW - padX * 2);
    const w = Math.min(maxW, Math.max(...lines.map(l => UI.width(c, l, size, 500))) + padX * 2), h = lines.length * size * 1.3 + 44;
    const bx = mine ? x - w : x;
    UI.box(c, bx, y, w, h, 46, mine ? (o.color || '#0a84ff') : (o.other || '#2c2c2e'));
    lines.forEach((l, i) => UI.text(c, l, bx + padX, y + 22 + size * 1.05 + i * size * 1.3, { size, weight: 500, color: '#fff' }));
    return h;
  };
  UI.typing = (c, x, y, t) => {
    UI.box(c, x, y, 170, 92, 46, '#2c2c2e');
    for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - i * 0.9)); c.globalAlpha = a; c.beginPath(); c.arc(x + 48 + i * 37, y + 46, 12, 0, Math.PI * 2); c.fillStyle = '#ccc'; c.fill(); }
    c.globalAlpha = 1;
  };

  // ---------------------------------------------------------------- big animated counter
  UI.counter = (c, n, x, y, size, o = {}) => {
    const s = typeof n === 'string' ? n : U.fmt(Math.round(n));
    UI.text(c, s, x, y, Object.assign({ size, weight: 900, font: F_CAP, align: 'center', color: '#fff', shadow: 'rgba(0,0,0,0.5)', blur: 30 }, o));
  };

  // ---------------------------------------------------------------- bottom nav
  UI.nav = (c, active) => {
    c.fillStyle = '#000'; c.fillRect(0, H - 150, W, 150);
    const items = [['home', 'Home'], ['search', 'Discover'], [null, ''], ['msg', 'Inbox'], ['user', 'Profile']];
    items.forEach(([ic, lab], i) => {
      const x = 108 + i * 216;
      if (!ic) { UI.box(c, x - 64, H - 128, 128, 80, 22, '#fff'); UI.icon(c, 'plus', x - 26, H - 114, 52, '#000'); return; }
      const col = lab === active ? '#fff' : 'rgba(255,255,255,0.6)';
      UI.icon(c, ic, x - 28, H - 132, 56, col);
      UI.text(c, lab, x, H - 40, { size: 26, weight: 600, color: col, align: 'center' });
    });
  };
})();
