/* TikTok Famous (screen-life): the rest of the song, and the full timeline */
(function () {
  const SL = window.SL, UI = SL.UI, U = SL.U, W = SL.W, H = SL.H, S = SL.SCENES;
  const ME = SL.ME, pulse = SL.pulse, pop = SL.pop;
  const bg = (c, col) => { c.fillStyle = col; c.fillRect(0, 0, W, H); };
  const F = UI.F_UI, CAP = UI.F_CAP;

  // ---------------------------------------------------------------- shared pieces
  function wallpaper(c, t, kind) {
    const g = c.createLinearGradient(0, 0, W * 0.4, H);
    const sets = {
      night: ['#120a2a', '#2b1055', '#0a1a3a'], dawn: ['#2b1a4a', '#ff7a8a', '#ffc58a'], day: ['#7ec8ff', '#b9a6ff', '#ffd6e8'],
      late: ['#05060d', '#0d1030', '#040409'], morning: ['#ffe0c2', '#ff9eb5', '#9bb8ff'],
    };
    const [a, b, d] = sets[kind] || sets.night;
    g.addColorStop(0, a); g.addColorStop(0.55, b); g.addColorStop(1, d);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (kind === 'night' || kind === 'late') for (let i = 0; i < 90; i++) { const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)); c.globalAlpha = tw * (kind === 'late' ? 0.5 : 0.8); c.fillStyle = '#fff'; c.beginPath(); c.arc(W * U.hash(i), H * 0.7 * U.hash(i + 9), 1.5 + 2 * U.hash(i + 4), 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
    // soft glow blobs
    for (let i = 0; i < 3; i++) { const x = W * (0.2 + 0.6 * U.hash(i + 30)), y = H * (0.3 + 0.5 * U.hash(i + 40)), r = 500; const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(255,255,255,0.10)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, H); }
  }
  // lock screen: { time, date, wall, notifs: [{at, title, body, icon, seed, out}], dnd, dim }
  function lock(c, t, o) {
    wallpaper(c, t, o.wall || 'night');
    UI.status(c, { time: '', dnd: o.dnd, battery: o.battery, activity: o.activity });
    UI.icon(c, 'lock', W / 2 - 22, 150, 44, '#fff');
    UI.text(c, o.date || 'Monday, October 12', W / 2, 300, { size: 46, weight: 600, align: 'center', color: 'rgba(255,255,255,0.9)' });
    UI.text(c, o.time, W / 2, 540, { size: 250, weight: 700, align: 'center', color: '#fff', font: "'Inter', -apple-system, sans-serif" });
    let y = 1040;
    (o.notifs || []).forEach(n => {
      const k = U.out5(U.range(t, n.at, n.at + 0.35)), out = n.out ? U.inOut(U.range(t, n.out, n.out + 0.3)) : 0;
      if (k <= 0) return;
      c.save(); c.globalAlpha = k * (1 - out); c.translate(-out * W, (1 - k) * 60);
      UI.notif(c, 30, y, W - 60, n); c.restore();
      y += 196 * k * (1 - out);
    });
    // flashlight + camera buttons, home bar
    for (const x of [150, W - 150]) { UI.glass(c, x - 80, 1660, 160, 160, 80, 'rgba(255,255,255,0.12)'); }
    UI.icon(c, 'camera', W - 186, 1704, 72, '#fff');
    UI.text(c, '⚡', 150, 1765, { size: 70, align: 'center' });
    UI.homeBar(c);
    if (o.dim) { c.fillStyle = `rgba(0,0,0,${o.dim})`; c.fillRect(0, 0, W, H); }
  }
  function header(c, title, o = {}) {
    UI.text(c, title, o.align === 'left' ? 60 : W / 2, 250, { size: o.size || 54, weight: 800, align: o.align || 'center', color: o.color || '#fff' });
    if (o.back) UI.text(c, '‹', 60, 255, { size: 90, weight: 400, color: '#0a84ff' });
  }
  function keyboard(c, t, pressT) {
    const y0 = H - 760;
    UI.glass(c, 0, y0, W, 760, 0, 'rgba(40,40,46,0.88)');
    const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    rows.forEach((r, ri) => {
      const kw = 92, gap = 14, total = r.length * kw + (r.length - 1) * gap, ox = (W - total) / 2;
      [...r].forEach((ch, i) => {
        const x = ox + i * (kw + gap), y = y0 + 40 + ri * 150;
        const hit = pressT !== undefined && Math.floor(U.hash(Math.floor(t * 9)) * 26) === (ri * 10 + i) && t - pressT < 99;
        UI.box(c, x, y, kw, 124, 16, hit ? '#9a9aa3' : '#6b6b72');
        UI.text(c, ch, x + kw / 2, y + 82, { size: 50, weight: 400, align: 'center' });
      });
    });
    UI.box(c, 260, y0 + 500, 560, 124, 16, '#6b6b72'); UI.text(c, 'space', W / 2, y0 + 580, { size: 40, weight: 400, align: 'center' });
    UI.box(c, 840, y0 + 500, 200, 124, 16, '#0a84ff'); UI.text(c, 'return', 940, y0 + 580, { size: 38, weight: 500, align: 'center' });
    UI.homeBar(c);
  }
  // text typed between t0 and t1
  const typed = (s, t, t0, t1) => s.slice(0, Math.round(s.length * U.range(t, t0, t1)));
  const caret = t => (Math.floor(t * 2.2) % 2 ? '' : '|');
  function appTile(c, x, y, s, name, cols, glyph, label, wig) {
    c.save(); c.translate(x + s / 2, y + s / 2); if (wig) c.rotate(Math.sin(wig) * 0.035);
    const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
    UI.box(c, -s / 2, -s / 2, s, s, s * 0.23, g);
    if (glyph) UI.icon(c, glyph, -s * 0.3, -s * 0.3, s * 0.6, '#fff');
    c.restore();
    if (label !== false) UI.text(c, name, x + s / 2, y + s + 44, { size: 30, weight: 500, align: 'center', shadow: 'rgba(0,0,0,0.4)' });
  }
  const APPS = [['Messages', ['#5df57a', '#1fc24a'], 'msg'], ['Phone', ['#5df57a', '#1fc24a'], 'phone'], ['Camera', ['#c7c7cc', '#8e8e93'], 'camera'], ['Photos', ['#ffcc00', '#ff2d55'], 'star'],
    ['Music', ['#ff6f8a', '#ff2d55'], 'music'], ['Notes', ['#ffe680', '#ffcc00'], 'msg'], ['Settings', ['#aeaeb2', '#636366'], 'gear'], ['Clock', ['#2c2c2e', '#000'], 'bell'],
    ['Mail', ['#5ac8fa', '#0a84ff'], 'inbox'], ['Wallet', ['#2c2c2e', '#1c1c1e'], 'bookmark'], ['Health', ['#fff', '#f2f2f7'], 'heart'], ['Store', ['#5ac8fa', '#0a60ff'], 'star']];

  // ---------------------------------------------------------------- intro: midnight upload
  S.tickTock = (c, t) => {
    const flip = t >= 3.6;
    const colon = [0.72, 1.32, 2.16, 2.42].some(a => t >= a && t < a + 0.22) ? 0.25 : 1;
    lock(c, t, { time: flip ? '12:00' : '11:59', date: 'Sunday, October 11', wall: 'night', notifs: [{ at: 3.0, title: 'FYP', body: 'Your video is ready to post ✨', seed: 0, icon: 'play', when: 'now' }] });
    c.fillStyle = `rgba(18,10,42,${1 - colon})`; c.fillRect(W / 2 - 28, 360, 56, 200);
    const fl = pulse(t, 3.6, 0.3); if (fl) { c.fillStyle = `rgba(255,255,255,${0.25 * fl})`; c.fillRect(0, 0, W, H); }
  };
  S.upload = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '12:01' });
    header(c, 'Post', { back: true, size: 48 });
    UI.video(c, 60, 330, 300, 530, t, { seed: 0, r: 20, label: 'day 1' });
    const cap = 'day 1 of trying to go viral ';
    UI.box(c, 400, 330, 620, 530, 24, '#1c1c1e');
    const tags = ['#fyp', '#foryou', '#viral', '#viral'];
    let line = typed(cap, t, 4.8, 7.6);
    const shownTags = tags.filter((g, i) => t >= [7.7, 8.1, 7.88, 8.92][i]);
    UI.wrap(c, line + shownTags.join(' ') + (t < 11 ? caret(t) : ''), 44, 500, 560).forEach((l, i) => UI.text(c, l, 430, 410 + i * 60, { size: 44, weight: 500 }));
    // hashtag chips pop on "viral, viral"
    ['#viral', '#fyp', '#foryou', '#trending', '#pov'].forEach((g, i) => {
      const at = [7.88, 8.92, 9.7, 10.2, 10.5][i], k = pop(t, at, 0.3);
      if (k <= 0) return;
      const x = 60 + (i % 3) * 330, y = 890 + Math.floor(i / 3) * 100;
      c.save(); c.translate(x + 150, y + 40); c.scale(k, k);
      UI.box(c, -150, -46, 300, 92, 46, i < 2 ? '#ff2d55' : '#2c2c2e'); UI.text(c, g, 0, 16, { size: 42, weight: 700, align: 'center' }); c.restore();
    });
    const pressed = t >= 10.74;
    UI.box(c, 60, 1060, W - 120, 120, 30, pressed ? '#c41e43' : '#ff2d55');
    UI.text(c, pressed ? 'Posting…' : 'Post', W / 2, 1140, { size: 52, weight: 800, align: 'center' });
    if (t < 10.74) keyboard(c, t, 4.8);
  };
  // overnight: the clock runs, nothing comes in
  S.overnight = (c, t) => {
    const k = U.range(t, 11.3, 18.2);
    const mins = Math.round(U.lerp(1, 7 * 60, Math.pow(k, 1.6)));
    const hh = Math.floor(mins / 60), mm = mins % 60;
    const time = (hh === 0 ? 12 : hh) + ':' + String(mm).padStart(2, '0');
    lock(c, t, { time, date: k < 0.05 ? 'Sunday, October 11' : 'Monday, October 12', wall: k < 0.7 ? 'night' : 'dawn', notifs: [{ at: 11.4, title: 'FYP', body: 'Posted! Let’s see how it does', seed: 0, icon: 'check', when: '12:01 AM' }], dim: 0.55 * Math.sin(Math.PI * U.c01(k * 1.1)) });
  };
  // wake up: alarm, Face ID unlock, notifications shade
  S.alarm = (c, t) => {
    wallpaper(c, t, 'dawn');
    UI.status(c, { time: '7:00', activity: t < 19.6 ? { kind: 'timer', text: 'Alarm' } : null });
    const shake = t < 19.4 ? Math.sin(t * 60) * 8 : 0;
    c.save(); c.translate(shake, 0);
    UI.text(c, '7:00', W / 2, 560, { size: 250, weight: 700, align: 'center' });
    UI.text(c, 'Alarm · school', W / 2, 680, { size: 50, weight: 600, align: 'center', color: 'rgba(255,255,255,0.9)' });
    c.restore();
    const stop = U.range(t, 19.0, 19.5);
    UI.glass(c, 140, 1320, W - 280, 170, 85, `rgba(255,255,255,${0.25 + 0.3 * stop})`);
    UI.text(c, stop > 0.6 ? 'Stopped' : 'Stop', W / 2, 1428, { size: 58, weight: 700, align: 'center' });
    // Face ID on "check my phone"
    const f = U.range(t, 19.86, 20.6);
    if (f > 0) {
      c.fillStyle = `rgba(0,0,0,${0.5 * f})`; c.fillRect(0, 0, W, H);
      c.save(); c.translate(W / 2, 900); c.scale(0.9 + 0.1 * U.back(f), 0.9 + 0.1 * U.back(f));
      c.strokeStyle = f > 0.7 ? '#30d158' : '#fff'; c.lineWidth = 12; c.lineCap = 'round';
      UI.rr(c, -110, -110, 220, 220, 50); c.stroke();
      if (f > 0.7) { c.beginPath(); c.moveTo(-50, 0); c.lineTo(-10, 40); c.lineTo(60, -40); c.stroke(); }
      c.restore();
      UI.text(c, f > 0.7 ? 'Unlocked' : 'Face ID', W / 2, 1100, { size: 44, weight: 600, align: 'center' });
    }
  };

  // ---------------------------------------------------------------- chorus pieces
  // a million strangers: a wall of viewers
  S.strangers = (c, t, o = {}) => {
    bg(c, '#000');
    const t0 = o.t0 || 52.56, k = U.range(t, t0, t0 + 3.6);
    const z = U.lerp(3.2, 1, U.out(k));
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    const s = 72;
    for (let y = 0; y < H / s + 1; y++) for (let x = 0; x < W / s + 1; x++) {
      const i = y * 40 + x, cx = x * s + s / 2, cy = y * s + s / 2;
      const hi = o.highlight && x === 7 && y === 13;
      UI.avatar(c, cx, cy, s * 0.42, i % 7, hi ? '#30d158' : null);
    }
    c.restore();
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, W, H);
    UI.status(c, { time: o.time || '10:38' });
    UI.icon(c, 'eye', W / 2 - 60, 640, 120, '#fff');
    UI.counter(c, U.fmt(Math.round((o.views || 1000000) * U.out(k))), W / 2, 920, 220);
    UI.text(c, 'views', W / 2, 1010, { size: 54, weight: 700, align: 'center' });
    UI.glass(c, W / 2 - 300, 1110, 600, 110, 55, 'rgba(255,255,255,0.18)');
    UI.text(c, '◉  Mia’s bedroom', W / 2, 1182, { size: 42, weight: 700, align: 'center' });
    if (o.highlight) UI.text(c, 'Mom watched your video', W / 2, 1340, { size: 44, weight: 700, align: 'center', color: '#30d158' });
  };
  // phone app recents: nobody
  S.noCalls = (c, t, o = {}) => {
    bg(c, '#000');
    UI.status(c, { time: o.time || '10:42' });
    header(c, 'Recents', { align: 'left', size: 80 });
    UI.box(c, 60, 300, 420, 80, 18, '#1c1c1e'); UI.box(c, 66, 306, 204, 68, 14, '#636366');
    UI.text(c, 'All', 168, 352, { size: 36, weight: 600, align: 'center' }); UI.text(c, 'Missed', 375, 352, { size: 36, weight: 600, align: 'center' });
    const k = U.c01((t - (o.t0 || 56.64)) / 0.4);
    UI.icon(c, 'phone', W / 2 - 80, 760, 160, `rgba(142,142,147,${k})`);
    UI.text(c, 'No Recents', W / 2, 1040, { size: 60, weight: 700, align: 'center', color: `rgba(255,255,255,${k})` });
    // tab bar
    c.fillStyle = '#121214'; c.fillRect(0, H - 190, W, 190);
    ['Favorites', 'Recents', 'Contacts', 'Keypad', 'Voicemail'].forEach((n, i) => UI.text(c, n, 108 + i * 216, H - 70, { size: 28, weight: 500, align: 'center', color: i === 1 ? '#0a84ff' : '#8e8e93' }));
    UI.homeBar(c);
  };
  // contacts: no results
  S.contacts = (c, t, o = {}) => {
    bg(c, '#000');
    UI.status(c, { time: o.time || '10:44' });
    header(c, 'Contacts', { align: 'left', size: 80 });
    UI.box(c, 50, 300, W - 100, 100, 26, '#1c1c1e');
    UI.icon(c, 'search', 80, 326, 48, '#8e8e93');
    const q = o.query || 'Mia';
    UI.text(c, typed(q, t, o.t0 || 62.08, (o.t0 || 62.08) + 0.6) + caret(t), 150, 368, { size: 44, weight: 500 });
    if (o.found) {
      UI.avatar(c, 140, 560, 64, 4); UI.text(c, o.found, 240, 578, { size: 48, weight: 600 });
      UI.text(c, 'mobile · last called today', 240, 630, { size: 34, weight: 400, color: '#8e8e93' });
    } else UI.text(c, 'No Results for “' + q + '”', W / 2, 860, { size: 52, weight: 700, align: 'center', color: t > (o.t0 || 62.08) + 0.7 ? '#fff' : 'rgba(0,0,0,0)' });
    keyboard(c, t, o.t0 || 62.08);
  };
  // messages thread
  // msgs: [[at, mine, text, status?]]
  S.chat = (c, t, o) => {
    bg(c, '#000');
    UI.status(c, { time: o.time || '10:47' });
    UI.box(c, 0, 0, W, 330, 0, 'rgba(28,28,30,0.96)');
    UI.avatar(c, W / 2, 210, 62, o.seed || 2);
    UI.text(c, o.name, W / 2, 310, { size: 34, weight: 600, align: 'center' });
    UI.text(c, '‹', 60, 230, { size: 90, weight: 400, color: '#0a84ff' });
    let y = 400;
    for (const [at, mine, text, status] of o.msgs) {
      const k = U.out5(U.range(t, at, at + 0.3));
      if (k <= 0) continue;
      c.save(); c.globalAlpha = k; c.translate(0, (1 - k) * 40);
      const h = UI.bubble(c, mine ? W - 50 : 50, y, text, mine);
      c.restore();
      y += h + 18;
      if (status && mine) { UI.text(c, typeof status === 'function' ? status(t) : status, W - 60, y + 30, { size: 30, weight: 500, color: '#8e8e93', align: 'right' }); y += 50; }
    }
    if (o.typing && t >= o.typing[0] && t < o.typing[1]) UI.typing(c, 50, y + 10, t);
    // input bar
    c.fillStyle = '#000'; c.fillRect(0, H - 200, W, 200);
    UI.box(c, 130, H - 170, W - 180, 96, 48, null, '#3a3a3c', 3);
    UI.text(c, 'iMessage', 175, H - 106, { size: 38, weight: 400, color: '#636366' });
    UI.homeBar(c);
  };
  // calling, failing, ringing, talking
  // states: [[at, 'calling'|'failed'|'noanswer'|'incoming'|'active']]
  S.call = (c, t, o) => {
    let st = o.states[0][1], st0 = o.states[0][0];
    for (const [at, s] of o.states) if (t >= at) { st = s; st0 = at; }
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a3a52'); g.addColorStop(1, '#101018'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    UI.status(c, { time: o.time || '10:52', activity: st === 'active' ? { kind: 'call', text: fmtT(t - st0) } : null });
    UI.avatar(c, W / 2, 470, 150, o.seed || 2);
    UI.text(c, o.name, W / 2, 760, { size: 84, weight: 600, align: 'center' });
    const sub = { calling: 'calling…', failed: 'Call Failed', noanswer: 'No Answer', incoming: 'mobile', active: fmtT(t - st0) }[st];
    UI.text(c, sub, W / 2, 840, { size: 46, weight: 500, align: 'center', color: st === 'failed' || st === 'noanswer' ? '#ff453a' : 'rgba(255,255,255,0.75)' });
    if (st === 'incoming') {
      // slide to answer
      const k = U.range(t, o.answerAt - 0.5, o.answerAt);
      UI.glass(c, 110, 1560, W - 220, 170, 85, 'rgba(255,255,255,0.16)');
      UI.text(c, 'slide to answer', W / 2 + 60, 1662, { size: 44, weight: 500, align: 'center', color: 'rgba(255,255,255,0.75)' });
      const kx = 120 + k * (W - 400);
      UI.box(c, kx, 1570, 150, 150, 75, '#30d158'); UI.icon(c, 'phone', kx + 37, 1607, 76, '#fff');
      const ring = 0.5 + 0.5 * Math.sin(t * 14); c.beginPath(); c.arc(W / 2, 470, 170 + ring * 20, 0, Math.PI * 2); c.strokeStyle = `rgba(48,209,88,${0.5 * ring})`; c.lineWidth = 8; c.stroke();
    } else {
      ['mute', 'keypad', 'speaker', 'add', 'FaceTime', 'contacts'].forEach((n, i) => {
        const x = 240 + (i % 3) * 300, y = 1110 + Math.floor(i / 3) * 280;
        c.beginPath(); c.arc(x, y, 104, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fill();
        UI.text(c, n, x, y + 160, { size: 32, weight: 500, align: 'center', color: 'rgba(255,255,255,0.8)' });
      });
      c.beginPath(); c.arc(W / 2, 1700, 104, 0, Math.PI * 2); c.fillStyle = st === 'active' || st === 'calling' ? '#ff3b30' : '#3a3a3c'; c.fill();
      c.save(); c.translate(W / 2, 1700); c.rotate(2.35); UI.icon(c, 'phone', -38, -38, 76, '#fff'); c.restore();
    }
    UI.homeBar(c);
  };
  const fmtT = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  // profile header with a big follower count
  S.profile = (c, t, o) => {
    bg(c, '#000');
    UI.status(c, { time: o.time || '10:46' });
    UI.text(c, ME, W / 2, 230, { size: 46, weight: 700, align: 'center' });
    if (o.verified) UI.icon(c, 'verified', W / 2 + 175, 196, 44, '#20d5ec');
    UI.avatar(c, W / 2, 400, 120, 0);
    const k = U.out(U.range(t, o.t0, o.t0 + 1.0));
    const n = Math.round(U.lerp(o.from, o.to, k));
    [['Following', '12'], ['Followers', U.fmt(n)], ['Likes', U.fmt(Math.round(n * 2.7))]].forEach(([lab, v], i) => {
      const x = W / 2 + (i - 1) * 320;
      UI.text(c, v, x, 640, { size: i === 1 ? 72 : 56, weight: 900, align: 'center', color: i === 1 ? '#fff' : '#ddd' });
      UI.text(c, lab, x, 700, { size: 34, weight: 500, align: 'center', color: '#8e8e93' });
    });
    for (let i = 0; i < 9; i++) {
      const x = 6 + (i % 3) * 358, y = 780 + Math.floor(i / 3) * 382;
      UI.video(c, x, y, 352, 376, t, { seed: (i * 3) % 7, vignette: true });
      UI.icon(c, 'play', x + 18, y + 320, 40, '#fff'); UI.text(c, U.fmt(Math.round(n * (0.4 + U.hash(i) * 1.6))), x + 66, y + 352, { size: 32, weight: 700 });
    }
  };
  // swipes: the whole screen swipes on each "swipe"
  S.swipes = (c, t, o) => {
    let i = 0; for (let j = 0; j < o.times.length; j++) if (t >= o.times[j]) i = j + 1;
    const last = i > 0 ? o.times[i - 1] : -9, k = U.inOut(U.range(t, last, last + 0.24));
    const post = j => j % 2 === 0
      ? { user: ME, verified: true, caption: o.caption || 'don’t swipe me away', likes: 2400000 + j * 1000, comments: 48200, saves: 120000, shares: 76000, seed: 0, avatarSeed: 0, label: ['don’t swipe me away', 'i’m here every day', 'please'][(j / 2 | 0) % 3], slot: 'post2', liked: true }
      : { user: SL.NAMES[(j * 5) % SL.NAMES.length], caption: 'wait for the end', likes: 31000 + j * 700, comments: 300, saves: 900, shares: 120, seed: (j % 6) + 1, avatarSeed: j + 3, label: ['pov: monday', 'rate my fit', 'get ready with me', 'storytime'][j % 4] };
    c.save();
    if (i > 0 && k < 1) { c.translate(0, -k * H); UI.feedPost(c, t, post(i - 1)); c.translate(0, H); UI.feedPost(c, t, post(i)); }
    else UI.feedPost(c, t, post(i));
    c.restore();
    UI.status(c, { time: o.time || '10:55' });
  };
  // live stream: hearts floating, comments, viewers
  S.live = (c, t, o = {}) => {
    UI.video(c, 0, 0, W, H, t, { seed: 4, ringLight: true, slot: 'live' });
    UI.status(c, { time: o.time || '11:02' });
    UI.box(c, 40, 160, 150, 64, 14, '#ff2d55'); UI.text(c, 'LIVE', 115, 206, { size: 38, weight: 900, align: 'center' });
    const v = o.viewers ? o.viewers(t) : Math.round(12000 + 140000 * U.range(t, o.t0 || 82.5, (o.t0 || 82.5) + 8));
    UI.glass(c, 210, 160, 260, 64, 14, 'rgba(0,0,0,0.35)'); UI.icon(c, 'eye', 228, 172, 40, '#fff'); UI.text(c, U.fmt(v), 280, 206, { size: 36, weight: 700 });
    // floating hearts up the right side
    const bp = SL.beatPos(t);
    for (let i = 0; i < 26 && v > 10; i++) {
      const life = 2.2, born = Math.floor(t * 6) / 6 - i / 6, age = t - born; if (age < 0 || age > life) continue;
      const k = age / life, x = 930 + Math.sin(age * 4 + i) * 50 - k * 60, y = 1700 - k * 900;
      c.globalAlpha = 1 - k; UI.icon(c, 'heart', x - 30, y - 30, 60 + 20 * U.hash(i + Math.floor(born * 6)), UI.pal(i + Math.floor(born * 6))[0]); c.globalAlpha = 1;
    }
    // comments stream bottom-left
    const cm = o.comments || ['ATE', 'mother is mothering', 'omg hi from brazil', 'slay', 'how is she this real', 'notice me!!', 'the vibes', 'QUEEN'];
    const n = Math.floor(t * 3);
    for (let j = 0; j < 6; j++) {
      const idx = n - j; if (idx < 0) continue;
      const y = 1580 - j * 96, a = 1 - j / 6;
      c.globalAlpha = a; UI.avatar(c, 80, y - 14, 30, idx % 7); UI.text(c, SL.NAMES[idx % SL.NAMES.length], 128, y - 22, { size: 30, weight: 700, color: 'rgba(255,255,255,0.85)' });
      UI.text(c, cm[idx % cm.length], 128, y + 18, { size: 36, weight: 600, shadow: 'rgba(0,0,0,0.5)' }); c.globalAlpha = 1;
    }
    if (o.ended && t >= o.ended) {
      c.fillStyle = 'rgba(0,0,0,0.75)'; c.fillRect(0, 0, W, H);
      UI.text(c, 'LIVE ended', W / 2, 860, { size: 80, weight: 900, align: 'center' });
      UI.text(c, (o.endViewers || 3) + ' viewers', W / 2, 960, { size: 48, weight: 500, align: 'center', color: '#aaa' });
    }
    UI.homeBar(c);
  };
  // comment section flood
  S.comments = (c, t, o) => {
    UI.video(c, 0, 0, W, H * 0.4, t, { seed: 0, slot: 'post2', label: 'day 3', vignette: false });
    UI.status(c, { time: o.time || '6:12' });
    UI.box(c, 0, H * 0.32, W, H * 0.7, 40, '#161618');
    UI.text(c, U.fmt(o.count || 48200) + ' comments', W / 2, H * 0.32 + 80, { size: 38, weight: 700, align: 'center' });
    const speed = o.speed ? o.speed(t) : 4, scroll = (t - o.t0) * speed;
    c.save(); UI.rr(c, 0, H * 0.32 + 120, W, H, 0); c.clip();
    for (let j = 0; j < 12; j++) {
      const idx = Math.floor(scroll) + j, y = H * 0.32 + 180 + (j - (scroll % 1)) * 150;
      const txt = o.list[idx % o.list.length];
      UI.avatar(c, 90, y, 40, idx % 7); UI.text(c, SL.NAMES[(idx * 7) % SL.NAMES.length], 150, y - 14, { size: 32, weight: 600, color: '#8e8e93' });
      UI.text(c, txt, 150, y + 30, { size: 40, weight: 500 });
      UI.icon(c, 'heart', 950, y - 24, 40, '#8e8e93'); UI.text(c, U.fmt(Math.round(900 + U.hash(idx) * 20000)), 970, y + 46, { size: 26, weight: 500, color: '#8e8e93', align: 'center' });
    }
    c.restore();
    UI.homeBar(c);
  };
  // group chat that went quiet
  S.groupChat = (c, t) => {
    S.chat(c, t, { name: 'the girls <3', seed: 6, time: '6:08', msgs: [[0, false, 'lol', null], [0, true, 'guys my video is blowing up!!', 'Read by everyone · 3 days ago']] });
    UI.text(c, 'Thursday 9:14 PM', W / 2, 395, { size: 28, weight: 500, color: '#8e8e93', align: 'center' });
  };
  // mom yells dinner
  S.dinner = (c, t) => {
    S.ringOn(c, t);
    const k = U.out5(U.range(t, 94.88, 95.2)), out = U.inOut(U.range(t, 95.8, 96.1));
    const bounce = Math.abs(Math.sin((t - 94.88) * 14)) * 18 * (1 - U.range(t, 94.88, 95.6));
    if (k > 0) UI.notif(c, 30 - out * W, -220 + k * 350 - bounce, W - 60, { title: 'Mom ♥', body: 'DINNER!!! come down NOW', seed: 4, icon: 'msg', iconA: '#30d158', iconB: '#00a86b' });
    const tk = pop(t, 96.16, 0.3);
    if (tk > 0) { c.save(); c.translate(W / 2, 900); c.rotate(-0.06); c.scale(tk, tk); UI.box(c, -280, -110, 560, 200, 30, '#fff'); UI.text(c, 'take 13', 0, 30, { size: 100, weight: 900, font: CAP, color: '#ff2d55', align: 'center' }); c.restore(); }
  };
  // screen time report
  S.screenTime = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '9:58' });
    header(c, 'Screen Time', { size: 60 });
    UI.box(c, 50, 330, W - 100, 760, 36, '#1c1c1e');
    UI.text(c, 'Daily Average', 100, 420, { size: 38, weight: 500, color: '#8e8e93' });
    const k = U.out(U.range(t, 96.6, 97.7));
    const mins = Math.round(544 * k);
    UI.text(c, Math.floor(mins / 60) + 'h ' + String(mins % 60).padStart(2, '0') + 'm', 100, 530, { size: 96, weight: 800 });
    UI.text(c, '↑ 38% from last week', 100, 600, { size: 36, weight: 600, color: '#ff453a' });
    const days = [5.2, 6.1, 7.4, 8.0, 9.1, 9.6, 9.07];
    days.forEach((d, i) => { const bh = 380 * (d / 10) * k, x = 110 + i * 125; UI.box(c, x, 1040 - bh, 80, bh, 14, i === 6 ? '#ff453a' : '#0a84ff'); UI.text(c, 'MTWTFSS'[i], x + 40, 1080, { size: 30, weight: 600, color: '#8e8e93', align: 'center' }); });
    // limit warning and the tap that ignores it
    const w = U.out5(U.range(t, 97.9, 98.2));
    if (w > 0) {
      c.fillStyle = `rgba(0,0,0,${0.5 * w})`; c.fillRect(0, 0, W, H);
      c.save(); c.translate(0, (1 - w) * 400);
      UI.glass(c, 120, 1200, W - 240, 520, 46, 'rgba(44,44,46,0.92)');
      UI.text(c, 'Time Limit', W / 2, 1300, { size: 50, weight: 800, align: 'center' });
      UI.text(c, 'You’ve reached your limit on FYP.', W / 2, 1370, { size: 36, weight: 500, align: 'center', color: '#ccc' });
      const tap = t > 98.6;
      UI.box(c, 170, 1440, W - 340, 110, 26, tap ? '#3a3a3c' : '#2c2c2e'); UI.text(c, 'OK', W / 2, 1512, { size: 42, weight: 600, align: 'center', color: '#0a84ff' });
      UI.box(c, 170, 1570, W - 340, 110, 26, tap ? '#0a84ff' : '#2c2c2e'); UI.text(c, 'Ignore Limit', W / 2, 1642, { size: 42, weight: 700, align: 'center', color: tap ? '#fff' : '#0a84ff' });
      c.restore();
    }
  };
  // gotta be extra: kaleidoscope camera
  S.extra = (c, t) => {
    bg(c, '#000');
    const bp = SL.beatPos(t), seg = Math.floor(bp) % 4;
    c.save(); c.translate(W / 2, H / 2);
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2 + bp * 0.2); c.scale(i % 2 ? -1 : 1, 1); UI.video(c, 0, 0, W * 0.75, H * 0.75, t, { seed: (seg + i) % 7, ringLight: i === 0, vignette: false }); c.restore(); }
    c.restore();
    c.globalCompositeOperation = 'overlay'; c.fillStyle = UI.pal(seg)[0]; c.globalAlpha = 0.35; c.fillRect(0, 0, W, H); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    UI.status(c, { time: '10:03', activity: { kind: 'rec', text: fmtT(t - 99) } });
  };
  // terms of service: give us your soul
  S.soul = (c, t) => {
    S.algo(c, t + 0, { verified: true, base: 2400000 });
    const k = U.out5(U.range(t, 101.04, 101.35)), acc = t > 102.02;
    c.fillStyle = `rgba(0,0,0,${0.55 * k})`; c.fillRect(0, 0, W, H);
    if (k <= 0) return;
    c.save(); c.translate(W / 2, H / 2 - 80); c.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); c.globalAlpha = k;
    UI.glass(c, -420, -300, 840, 600, 46, 'rgba(242,242,247,0.92)');
    UI.text(c, 'Updated Terms', 0, -190, { size: 50, weight: 800, align: 'center', color: '#111' });
    ['To keep growing, you agree to', 'give us your soul. Your data, your', 'time and your sleep are included.'].forEach((l, i) => UI.text(c, l, 0, -110 + i * 54, { size: 36, weight: 500, align: 'center', color: '#333' }));
    c.fillStyle = '#c6c6c8'; c.fillRect(-420, 110, 840, 2); c.fillRect(0, 110, 2, 190);
    UI.text(c, 'Decline', -210, 220, { size: 44, weight: 500, align: 'center', color: '#8e8e93' });
    UI.box(c, 4, 114, 412, 182, 0, acc ? 'rgba(0,122,255,0.15)' : 'rgba(0,0,0,0)');
    UI.text(c, 'Accept', 210, 220, { size: 46, weight: 800, align: 'center', color: '#0a84ff' });
    c.restore();
  };
  // child of the feed: infinite scroll that keeps accelerating
  S.feedLoop = (c, t) => {
    const k = U.range(t, 102.4, 103.8), pos = (t - 102.4) * (2 + 18 * k * k);
    const i = Math.floor(pos), f = pos - i;
    const post = j => ({ user: SL.NAMES[(j * 3) % SL.NAMES.length], caption: 'wait for it', likes: 10000 + j * 3700, comments: 400, saves: 900, shares: 100, seed: j % 7, avatarSeed: j, label: ['pov', 'storytime', 'grwm', 'rate this', 'day in my life'][j % 5] });
    c.save(); c.translate(0, -f * H); UI.feedPost(c, t, post(i)); c.translate(0, H); UI.feedPost(c, t, post(i + 1)); c.restore();
    UI.status(c, { time: '10:05', battery: 0.08 });
  };
  // battery at 1%
  S.battery = (c, t) => {
    S.feedLoop(c, 103.8);
    const k = U.out5(U.range(t, 103.84, 104.1));
    c.fillStyle = `rgba(0,0,0,${0.55 * k})`; c.fillRect(0, 0, W, H);
    c.save(); c.translate(W / 2, H / 2); c.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); c.globalAlpha = k;
    UI.glass(c, -400, -220, 800, 440, 46, 'rgba(242,242,247,0.92)');
    UI.text(c, 'Low Battery', 0, -100, { size: 52, weight: 800, align: 'center', color: '#111' });
    UI.text(c, '1% battery remaining', 0, -30, { size: 40, weight: 500, align: 'center', color: '#333' });
    UI.box(c, -100, 30, 180, 80, 16, null, '#111', 6); UI.box(c, 84, 52, 12, 36, 4, '#111'); UI.box(c, -92, 38, 10, 64, 4, '#ff3b30');
    c.restore();
    UI.status(c, { time: '10:06', battery: 0.01 });
  };
  // clout is my currency: a wallet of clout
  S.clout = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '10:07', battery: 0.01 });
    header(c, 'Wallet', { align: 'left', size: 80 });
    const k = U.out(U.range(t, 104.8, 106.0));
    c.save(); c.translate(W / 2, 720); c.rotate(-0.04 + 0.04 * k);
    const g = c.createLinearGradient(-430, -260, 430, 260); g.addColorStop(0, '#ffcf3a'); g.addColorStop(1, '#ff7a00');
    UI.box(c, -430, -260, 860, 520, 46, g);
    UI.text(c, 'CLOUT', -370, -170, { size: 52, weight: 900, font: CAP, color: '#3a2200' });
    UI.counter(c, Math.round(2400000 * k).toLocaleString('en-US'), 0, 60, 120, { color: '#3a2200', shadow: null });
    UI.text(c, 'balance · followers', -370, 200, { size: 36, weight: 700, color: '#3a2200' });
    c.restore();
    // coins rain
    for (let i = 0; i < 24; i++) { const y = ((t * 900 + U.hash(i) * H * 2) % (H + 200)) - 100, x = W * U.hash(i + 7); c.beginPath(); c.ellipse(x, y, 34, 34 * Math.abs(Math.sin(t * 6 + i)), 0, 0, Math.PI * 2); c.fillStyle = '#ffc93a'; c.fill(); c.strokeStyle = '#c48a00'; c.lineWidth = 5; c.stroke(); }
    UI.homeBar(c);
  };

  // ---------------------------------------------------------------- the crash
  S.decline = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '2:31', battery: 0.12 });
    header(c, 'Analytics', { size: 56 });
    const k = U.range(t, 151.6, 160.5);
    UI.box(c, 50, 330, W - 100, 700, 36, '#1c1c1e');
    UI.text(c, 'Views, last 7 days', 100, 410, { size: 36, weight: 500, color: '#8e8e93' });
    const v = Math.round(U.lerp(10200000, 2800000, U.out(k)));
    UI.text(c, U.fmt(v), 100, 520, { size: 100, weight: 900 });
    UI.text(c, '↓ ' + Math.round(72 * U.out(k)) + '%', 100, 590, { size: 40, weight: 700, color: '#ff453a' });
    c.beginPath(); c.moveTo(100, 950);
    for (let s = 0; s <= 60; s++) { const u = s / 60; const up = Math.pow(Math.min(1, u / 0.55), 2), down = u > 0.55 ? Math.pow((u - 0.55) / 0.45, 0.7) * Math.min(1, k * 1.2) : 0; c.lineTo(100 + u * 880, 950 - 300 * up + 280 * down); }
    c.strokeStyle = '#ff453a'; c.lineWidth = 9; c.lineJoin = 'round'; c.stroke();
    const n = U.out5(U.range(t, 155.5, 155.9));
    if (n > 0) UI.notif(c, 30, 1150 + (1 - n) * 60, W - 60, { title: 'FYP Insights', body: 'Your views dropped 72% this week', seed: 3, icon: 'bell', when: 'now' });
    const dim = U.range(t, 158.5, 161.3); c.fillStyle = `rgba(0,0,0,${0.85 * dim})`; c.fillRect(0, 0, W, H);
  };
  // 3 a.m.
  S.threeAM = (c, t) => {
    lock(c, t, { time: '3:00', date: 'Thursday, October 15', wall: 'late', dnd: false, battery: 0.09, notifs: [], dim: 0.15 });
    const k = U.range(t, 162.4, 163.3);
    if (k > 0) {
      c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, W, H);
      UI.video(c, 0, 0, W, H, t, { seed: 1, slot: 'cry', vignette: true });
      c.fillStyle = 'rgba(5,10,30,0.72)'; c.fillRect(0, 0, W, H);
      UI.status(c, { time: '3:00', activity: { kind: 'rec', text: fmtT(t - 162.4) } });
      UI.text(c, typed('not me crying at 3am lol', t, 163.4, 164.4) + caret(t), W / 2, 700, { size: 58, weight: 800, font: CAP, align: 'center', shadow: 'rgba(0,0,0,0.6)' });
    }
  };
  S.takes5 = (c, t) => {
    bg(c, '#06070d');
    UI.status(c, { time: '3:07', battery: 0.08 });
    header(c, 'Drafts', { size: 50 });
    for (let i = 0; i < 5; i++) {
      const at = 164.6 + i * 0.36, k = U.back(U.range(t, at, at + 0.3)); if (k <= 0) continue;
      const x = 60 + (i % 2) * 490, y = 330 + Math.floor(i / 2) * 520;
      c.save(); c.translate(x + 230, y + 245); c.scale(k, k); c.translate(-230, -245);
      UI.video(c, 0, 0, 460, 490, t, { seed: 1, r: 22, vignette: true }); c.fillStyle = 'rgba(5,10,30,0.6)'; UI.rr(c, 0, 0, 460, 490, 22); c.fill();
      UI.text(c, 'crying_take' + (i + 1) + '.mov', 24, 460, { size: 34, weight: 700 });
      if (i === 4) UI.box(c, 0, 0, 460, 490, 22, null, '#fff', 8);
      c.restore();
    }
  };
  S.soReal = (c, t) => {
    S.comments(c, t, { t0: 167.9, count: 12400, list: ['this is so real ♥', 'crying with u', 'felt this', 'who else is up at 3am', 'stay strong queen'], speed: () => 0.25, time: '3:12' });
    const k = pop(t, 168.88, 0.4);
    if (k > 0) { c.save(); c.translate(W / 2, 520); c.scale(k, k); UI.bubble(c, -360, -60, '“this is so real ♥”', false, { other: '#ff2d55', size: 54 }); c.restore(); }
  };
  S.keepScrolling = (c, t) => {
    const pos = Math.max(0, (t - 170.72) * 2.6), i = Math.floor(pos), f = U.inOut(pos - i);
    const post = j => j === 0
      ? { user: ME, verified: true, caption: 'not me crying at 3am lol', likes: 12400, comments: 980, saves: 300, shares: 40, seed: 1, avatarSeed: 0, label: 'not me crying at 3am lol', slot: 'cry' }
      : { user: SL.NAMES[(j * 5) % SL.NAMES.length], caption: 'next', likes: 400000 + j * 20000, comments: 9000, saves: 2000, shares: 1100, seed: (j % 6) + 1, avatarSeed: j + 2, label: ['dance trend', 'funny cat', 'rate my outfit', 'new trend'][j % 4] };
    c.save(); c.translate(0, -f * H); UI.feedPost(c, t, post(i)); c.translate(0, H); UI.feedPost(c, t, post(i + 1)); c.restore();
    UI.status(c, { time: '3:14' });
  };
  S.itWasReal = (c, t) => {
    bg(c, '#1c1c1e');
    UI.status(c, { time: '3:15', battery: 0.07 });
    UI.text(c, '‹ Notes', 60, 240, { size: 42, weight: 500, color: '#ffd60a' });
    UI.text(c, 'Today 3:15 AM', W / 2, 330, { size: 30, weight: 500, color: '#8e8e93', align: 'center' });
    UI.text(c, typed('it was real.', t, 173.28, 174.1) + caret(t), 70, 480, { size: 64, weight: 700 });
    keyboard(c, t, 173.28);
  };
  S.trending = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '3:20' });
    header(c, 'Trending', { align: 'left', size: 80 });
    const k = U.range(t, 177.6, 179.4);
    const rank = Math.round(U.lerp(1, 1203, Math.pow(k, 2)));
    const rows = [['@newgirl.xo', 'NEW', 6], ['@dancer.k', '', 1], ['@chef.leo', '', 3], ['@sam_s', '', 2]];
    rows.forEach(([u, tag, s], i) => { const y = 420 + i * 200; UI.text(c, '#' + (i + 1), 80, y + 20, { size: 60, weight: 900, color: i === 0 ? '#ffd60a' : '#fff' }); UI.avatar(c, 260, y, 64, s); UI.text(c, u, 350, y + 18, { size: 46, weight: 700 }); if (tag) { UI.box(c, 790, y - 30, 130, 60, 30, '#ff2d55'); UI.text(c, tag, 855, y + 12, { size: 30, weight: 800, align: 'center' }); } });
    UI.box(c, 50, 1300, W - 100, 230, 30, '#1c1c1e');
    UI.text(c, '#' + rank.toLocaleString('en-US'), 100, 1440, { size: 90, weight: 900, color: '#ff453a' });
    UI.avatar(c, 600, 1415, 60, 0); UI.text(c, ME, 690, 1435, { size: 42, weight: 700 });
  };
  S.refreshEmpty = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '3:24', battery: 0.06 });
    const pull = Math.max(pulse(t, 179.58, 0.4), pulse(t, 180.22, 0.4));
    c.save(); c.translate(0, pull * 200);
    header(c, 'Activity', { size: 54 });
    UI.icon(c, 'bell', W / 2 - 80, 640, 160, '#3a3a3c');
    UI.text(c, 'No new activity', W / 2, 920, { size: 56, weight: 700, align: 'center' });
    UI.text(c, 'is anybody there?', W / 2, 1000, { size: 40, weight: 500, align: 'center', color: '#636366' });
    c.restore();
    if (pull > 0.05) { c.save(); c.translate(W / 2, 140 + pull * 100); c.rotate(t * 12); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.globalAlpha = (i + 1) / 8; UI.box(c, -5, -34, 10, 22, 5, '#fff'); } c.restore(); c.globalAlpha = 1; }
  };
  S.emptyLive = (c, t) => S.live(c, t, { viewers: () => 0, time: '3:26', comments: ['…'], ended: 999 });
  S.emptyLiveOverlay = (c, t) => {
    S.live(c, t, { viewers: () => 0, time: '3:26', comments: [''] });
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(0, 0, W, H);
    UI.counter(c, '0', W / 2, 980, 300); UI.text(c, 'viewers', W / 2, 1080, { size: 54, weight: 700, align: 'center' });
    UI.text(c, '300K followers', W / 2, 1180, { size: 42, weight: 500, align: 'center', color: '#aaa' });
  };
  // home screen: delete the app at 1:45, then get it back at 2:15
  S.deleteApp = (c, t) => {
    wallpaper(c, t, 'late');
    UI.status(c, { time: '1:45' });
    const wig = t > 183.7;
    APPS.forEach(([n, cols, g], i) => appTile(c, 72 + (i % 4) * 250, 220 + Math.floor(i / 4) * 290, 186, n, cols, g, true, wig ? t * 18 + i : 0));
    // the FYP app
    const gone = U.range(t, 184.66, 185.0);
    if (gone < 1) { c.save(); c.globalAlpha = 1 - gone; c.translate(72 + 93, 1090 + 93); c.scale(1 - gone, 1 - gone); c.translate(-93, -93); appTile(c, 0, 0, 186, 'FYP', ['#ff2d55', '#7a2cff'], 'music', true, wig ? t * 18 : 0); UI.box(c, -16, -16, 56, 56, 28, '#8e8e93'); UI.text(c, '–', 12, 22, { size: 50, weight: 800, align: 'center' }); c.restore(); }
    const d = U.out5(U.range(t, 184.0, 184.25)) * (1 - U.range(t, 184.66, 184.8));
    if (d > 0) {
      c.fillStyle = `rgba(0,0,0,${0.4 * d})`; c.fillRect(0, 0, W, H);
      c.save(); c.translate(W / 2, H / 2); c.scale(0.9 + 0.1 * d, 0.9 + 0.1 * d); c.globalAlpha = d;
      UI.glass(c, -380, -200, 760, 400, 40, 'rgba(242,242,247,0.92)');
      UI.text(c, 'Delete “FYP”?', 0, -90, { size: 46, weight: 800, align: 'center', color: '#111' });
      UI.text(c, 'Deleting this app will also delete its data.', 0, -30, { size: 30, weight: 500, align: 'center', color: '#333' });
      c.fillStyle = '#c6c6c8'; c.fillRect(-380, 40, 760, 2);
      UI.text(c, 'Delete', 0, 120, { size: 44, weight: 700, align: 'center', color: '#ff3b30' });
      c.restore();
    }
    UI.homeBar(c);
  };
  S.store = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '2:15' });
    appTile(c, 70, 260, 260, 'FYP', ['#ff2d55', '#7a2cff'], 'music', false);
    UI.text(c, 'FYP', 380, 340, { size: 64, weight: 800 }); UI.text(c, 'Entertainment', 380, 400, { size: 36, weight: 500, color: '#8e8e93' });
    const k = U.range(t, 185.4, 186.7);
    if (t < 185.4) { UI.box(c, 380, 450, 200, 76, 38, '#0a84ff'); UI.text(c, 'GET', 480, 503, { size: 38, weight: 800, align: 'center' }); }
    else if (k < 1) { c.beginPath(); c.arc(430, 488, 34, 0, Math.PI * 2); c.strokeStyle = '#3a3a3c'; c.lineWidth = 8; c.stroke(); c.beginPath(); c.arc(430, 488, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.strokeStyle = '#0a84ff'; c.stroke(); }
    else { UI.box(c, 380, 450, 220, 76, 38, '#0a84ff'); UI.text(c, 'OPEN', 490, 503, { size: 38, weight: 800, align: 'center' }); }
    UI.text(c, '4.8 ★★★★★', 70, 640, { size: 40, weight: 700, color: '#8e8e93' });
    UI.text(c, '#1 in Entertainment', 600, 640, { size: 36, weight: 600, color: '#8e8e93' });
    for (let i = 0; i < 3; i++) UI.video(c, 70 + i * 330, 720, 300, 540, t, { seed: i + 2, r: 26, label: ['you’re missing out', 'come back', 'we miss you'][i] });
  };
  // who am I when nobody's watching
  S.dark = (c, t) => {
    bg(c, '#000');
    const k = U.range(t, 187.12, 188.0);
    c.fillStyle = `rgba(255,255,255,${0.05 * (1 - k)})`; c.fillRect(0, 0, W, H);
    UI.text(c, '0 viewers', W / 2, H / 2, { size: 60, weight: 700, align: 'center', color: `rgba(255,255,255,${0.35 * (1 - k)})` });
    const r = c.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W); r.addColorStop(0, 'rgba(255,255,255,0.06)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, W, H);
  };
  S.stopsBuzzing = (c, t) => {
    const buzz = t < 190.5 ? Math.sin(t * 70) * 10 * (0.5 + 0.5 * Math.sin(t * 3)) : 0;
    c.save(); c.translate(buzz, 0);
    lock(c, t, { time: '2:16', date: 'Friday, October 16', wall: 'late', dnd: t > 190.5, notifs: [{ at: 189.2, out: 190.3, title: 'FYP', body: '3 people liked your video', seed: 0, icon: 'heart' }] });
    c.restore();
  };

  // ---------------------------------------------------------------- the turn: real people show up
  S.realOnes = (c, t) => S.famous(c, t - 191.97 + 44.96, { from: 320000, to: 360000, real: [['Mom ♥', 'dinner’s ready. love you'], ['Grandma', 'saw your video!! call me sweetheart'], ['Jess', 'miss u. coffee tmrw?'], ['Dad', 'proud of you kiddo']] });
  S.momCalls = (c, t) => S.call(c, t, { name: 'Mom ♥', seed: 4, time: '6:30', states: [[203.16, 'incoming'], [205.86, 'active']], answerAt: 205.86 });
  S.contactsFound = (c, t) => S.contacts(c, t, { t0: 207.0, query: 'Mom', found: 'Mom ♥', time: '6:41' });
  S.jessReplies = (c, t) => S.chat(c, t, { name: 'Jess', seed: 2, time: '6:44', msgs: [[0, true, 'hey', 'Delivered'], [0, true, 'did u see my vid??', 'Delivered'], [211.7, false, 'omg ur video made me cry'], [212.6, false, 'coffee tmrw? i miss u'], [213.6, true, 'YES', () => (t => (t > 214.2 ? 'Read' : 'Delivered'))(t)]], typing: [211.25, 211.7] });
  S.limit = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '6:50' });
    header(c, 'App Limits', { size: 60 });
    UI.box(c, 50, 330, W - 100, 420, 36, '#1c1c1e');
    appTile(c, 90, 380, 120, 'FYP', ['#ff2d55', '#7a2cff'], 'music', false);
    UI.text(c, 'FYP', 250, 445, { size: 46, weight: 700 }); UI.text(c, 'Social', 250, 495, { size: 32, weight: 500, color: '#8e8e93' });
    const on = U.range(t, 216.8, 217.1);
    UI.box(c, 820, 410, 150, 90, 45, on > 0.5 ? '#30d158' : '#39393d');
    c.beginPath(); c.arc(865 + 60 * on, 455, 38, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    UI.text(c, 'Time', 100, 640, { size: 40, weight: 500 }); UI.text(c, on > 0.5 ? '1 hr a day' : 'Off', 970, 640, { size: 40, weight: 600, color: '#8e8e93', align: 'right' });
    const q = pop(t, 218.1, 0.4);
    if (q > 0) { c.save(); c.translate(W / 2, 1150); c.scale(q, q); UI.text(c, 'am i still relevant?', 0, 0, { size: 70, weight: 900, font: CAP, align: 'center', color: '#fff' }); c.restore(); }
  };
  S.sunrise = (c, t) => lock(c, t, { time: '7:12', date: 'Saturday, October 17', wall: 'morning', notifs: [{ at: 219.2, title: 'Jess', body: 'omw!! ☕', seed: 2, icon: 'msg', iconA: '#30d158', iconB: '#00a86b' }, { at: 219.6, title: 'FYP', body: 'You have 214 new notifications', seed: 0, icon: 'bell' }] });
  S.finalSwipes = (c, t) => {
    S.swipes(c, t, { times: [222.28, 223.36, 224.56, 225.3, 226.44, 227.04], time: '7:20' });
    // the phone locks on "away"
    const off = U.range(t, 229.6, 230.0);
    if (off > 0) { const h = H * (1 - off); c.fillStyle = '#000'; c.fillRect(0, 0, W, (H - h) / 2); c.fillRect(0, (H + h) / 2, W, (H - h) / 2); }
  };
  S.lockedEnd = (c, t) => {
    bg(c, '#000');
    const wake = U.range(t, 233.8, 234.3) * (1 - U.range(t, 239.6, 240.4));
    if (wake <= 0) return;
    c.globalAlpha = wake;
    lock(c, t, { time: '7:31', date: 'Saturday, October 17', wall: 'morning', notifs: [{ at: 234.0, out: 238.72, title: 'FYP', body: 'Your video hit 1M views! ✨', seed: 0, icon: 'play' }, { at: 235.2, title: 'Mom ♥', body: 'pancakes are ready, come down', seed: 4, icon: 'msg', iconA: '#30d158', iconB: '#00a86b' }] });
    c.globalAlpha = 1;
  };
  S.endCard = (c, t) => {
    bg(c, '#000');
    const k = U.range(t, 241.0, 242.2) * (1 - U.range(t, 245.4, 246.6));
    UI.text(c, 'tiktok famous', W / 2, H / 2, { size: 96, weight: 900, font: CAP, align: 'center', color: `rgba(255,255,255,${k})` });
    UI.text(c, 'go outside.', W / 2, H / 2 + 110, { size: 50, weight: 600, align: 'center', color: `rgba(255,255,255,${0.6 * k})` });
  };

  // ---------------------------------------------------------------- reuse hook scenes later in the song (re-timed to new word positions)
  const warp = (name, anchors, o) => (c, t) => {
    let i = 0; while (i < anchors.length - 1 && anchors[i + 1][0] <= t) i++;
    const [a0, b0] = anchors[i], nx = anchors[i + 1];
    const tt = nx && t >= a0 ? b0 + (t - a0) * (nx[1] - b0) / (nx[0] - a0) : b0 + (t - a0);
    S[name](c, tt, o);
  };
  S.famous1b = (c, t) => S.famous(c, t - 68.08 + 44.96, { from: 1000000, to: 1400000 });
  S.fyp = (c, t) => S.algo(c, t - 59.92 + 48.58, { verified: true, base: 1000000, label: 'day 4 of being famous' });
  S.followers1M = (c, t) => S.profile(c, t, { t0: 64.42, from: 980000, to: 1000000, verified: true, time: '11:20' });
  S.textJess = (c, t) => S.chat(c, t, { name: 'Jess', seed: 2, time: '11:24', msgs: [[66.0, true, 'hey'], [66.5, true, 'did u see my vid??'], [67.26, true, 'hello??', 'Delivered']], typing: [66.9, 67.6] });
  S.calling1 = (c, t) => S.call(c, t, { name: 'Jess', seed: 2, time: '11:31', states: [[71.34, 'calling'], [72.6, 'failed'], [73.62, 'calling'], [74.7, 'noanswer']] });
  S.swipes1 = (c, t) => S.swipes(c, t, { times: [75.98, 76.72, 77.88, 78.62, 79.78, 80.58, 81.68], time: '11:40' });
  S.live1 = (c, t) => S.live(c, t, { t0: 82.5 });
  S.loud = (c, t) => S.comments(c, t, { t0: 92.0, list: ['QUEEN', 'ur so pretty omg', 'you’re literally perfect', 'obsessed', 'mother', 'iconic', 'ATE', 'marry me'], speed: t => 3 + 10 * U.range(t, 92.0, 94.8), time: '6:12' });
  S.actions2 = warp('actions', [[106.68, 38.16], [107.52, 38.7], [107.9, 39.24], [108.34, 39.64], [108.6, 40.0]], { base: 1, verified: true, label: 'day 47 of being famous', caption: 'day 47 of being famous #fyp' });
  S.noScroll2 = warp('noScroll', [[108.6, 40.04], [111.9, 41.9]], { likes: 2400000, verified: true, label: 'don’t you dare', caption: 'day 47 of being famous #fyp' });
  S.holdOn2 = (c, t) => S.holdOn(c, t - 112.0 + 41.96, { label: 'day 48. wait for it', seed: 5 });
  S.famous2 = (c, t) => S.famous(c, t - 114.88 + 44.96, { from: 2400000, to: 10000000 });
  S.algo2 = (c, t) => S.algo(c, t - 118.74 + 48.58, { verified: true, base: 3000000, label: 'day 48 of being famous' });
  S.strangers2 = (c, t) => S.strangers(c, t, { t0: 122.6, views: 10000000, time: '7:02' });
  S.noCalls2 = (c, t) => S.noCalls(c, t, { t0: 126.52, time: '7:05' });
  S.contacts2 = (c, t) => S.contacts(c, t, { t0: 131.84, query: 'Mia', time: '7:09' });
  S.fyp2 = (c, t) => S.algo(c, t - 129.88 + 48.58, { verified: true, base: 5000000, label: 'suggested for you' });
  S.followers10M = (c, t) => S.profile(c, t, { t0: 134.32, from: 9800000, to: 10000000, verified: true, time: '7:14' });
  S.seen = (c, t) => S.chat(c, t, { name: 'Jess', seed: 2, time: '7:18', msgs: [[0, true, 'hey'], [0, true, 'did u see my vid??'], [0, true, 'hello??'], [135.9, true, 'are u mad at me', () => 'Read 2:14 AM']] });
  S.famous3 = (c, t) => S.famous(c, t - 137.94 + 44.96, { from: 10000000, to: 10200000 });
  S.calling2 = (c, t) => S.call(c, t, { name: 'Jess', seed: 2, time: '7:25', states: [[141.1, 'calling'], [142.3, 'failed'], [143.38, 'calling'], [144.4, 'noanswer']] });
  S.swipes2 = (c, t) => S.swipes(c, t, { times: [145.36, 146.48, 147.66, 149.46, 150.28], time: '7:31' });
  S.millionFinal = (c, t) => S.strangers(c, t, { t0: 199.5, views: 1000000, highlight: true, time: '6:28' });
  S.algoFinal = (c, t) => S.algo(c, t - 195.62 + 48.58, { verified: true, base: 320000, label: 'day 1 of going outside', caption: 'day 1 of going outside #touchgrass' });
  S.famousFinal = (c, t) => S.famous(c, t - 211.24 + 44.96, { from: 320000, to: 1000000, real: [['Jess', 'coffee tmrw? ☕'], ['Mom ♥', 'love you sweetheart'], ['Grandma', 'call me!! ♥']] });

  // ---------------------------------------------------------------- the full timeline: [start, scene, transition]
  SL.TIMELINE = [
    [0, 'tickTock', 'cut'], [4.7, 'upload', 'swipe'], [11.3, 'overnight', 'zoom'], [18.38, 'alarm', 'flash'],
    [22.19, 'likes47', 'zoom'], [26.3, 'ringOn', 'flash'], [27.62, 'drafts', 'swipe'], [28.58, 'filter', 'zoom'], [30.5, 'fifteen', 'swipe'],
    [32.15, 'teacher', 'swipe'], [34.3, 'lap', 'zoom'], [36.12, 'refresh', 'swipe'], [38.05, 'actions', 'swipe'], [40.04, 'noScroll', 'cut'],
    [41.9, 'holdOn', 'zoom'], [44.96, 'famous', 'flash'], [48.55, 'algo', 'swipe'], [51.4, 'million', 'zoom'],
    [52.56, 'strangers', 'zoom'], [56.5, 'noCalls', 'swipe'], [59.85, 'fyp', 'swipe'], [62.0, 'contacts', 'swipe'], [64.3, 'followers1M', 'zoom'],
    [65.9, 'textJess', 'swipe'], [68.0, 'famous1b', 'flash'], [71.2, 'calling1', 'zoom'], [75.9, 'swipes1', 'swipe'], [82.5, 'live1', 'flash'],
    [90.9, 'groupChat', 'zoom'], [92.0, 'loud', 'swipe'], [94.8, 'dinner', 'swipe'], [96.5, 'screenTime', 'swipe'], [99.0, 'extra', 'flash'],
    [101.0, 'soul', 'zoom'], [102.4, 'feedLoop', 'swipe'], [103.8, 'battery', 'cut'], [104.75, 'clout', 'zoom'], [106.6, 'actions2', 'swipe'],
    [108.55, 'noScroll2', 'cut'], [111.95, 'holdOn2', 'zoom'], [114.88, 'famous2', 'flash'], [118.6, 'algo2', 'swipe'], [122.5, 'strangers2', 'zoom'],
    [126.4, 'noCalls2', 'swipe'], [129.8, 'fyp2', 'swipe'], [131.7, 'contacts2', 'swipe'], [134.2, 'followers10M', 'zoom'], [135.7, 'seen', 'swipe'],
    [137.9, 'famous3', 'flash'], [141.0, 'calling2', 'zoom'], [145.3, 'swipes2', 'swipe'], [151.5, 'decline', 'zoom'],
    [161.4, 'threeAM', 'zoom'], [164.5, 'takes5', 'zoom'], [167.8, 'soReal', 'swipe'], [170.6, 'keepScrolling', 'swipe'], [173.1, 'itWasReal', 'zoom'],
    [175.3, 'decline2', 'zoom'], [177.5, 'trending', 'swipe'], [179.5, 'refreshEmpty', 'swipe'], [181.6, 'emptyLiveOverlay', 'zoom'],
    [183.3, 'deleteApp', 'swipe'], [185.1, 'store', 'swipe'], [187.1, 'dark', 'zoom'], [189.1, 'stopsBuzzing', 'zoom'],
    [191.97, 'realOnes', 'flash'], [195.5, 'algoFinal', 'swipe'], [199.5, 'millionFinal', 'zoom'], [203.1, 'momCalls', 'swipe'], [206.95, 'contactsFound', 'swipe'],
    [211.1, 'jessReplies', 'swipe'], [215.1, 'limit', 'zoom'], [219.0, 'sunrise', 'zoom'], [222.2, 'finalSwipes', 'swipe'], [230.4, 'lockedEnd', 'cut'],
    [240.6, 'endCard', 'zoom'],
  ];
  S.decline2 = (c, t) => {
    S.decline(c, t - 175.3 + 151.6 + 4.0);
    c.fillStyle = 'rgba(0,0,0,0)';
  };
  SL.CAPY = Object.assign(SL.CAPY || {}, { tickTock: 1500, upload: 1480, alarm: 1260, strangers: 1450, strangers2: 1450, millionFinal: 1500, noCalls: 1250, noCalls2: 1250, contacts: 640, contacts2: 640, contactsFound: 780, profile: 1700, followers1M: 760, followers10M: 760, textJess: 1500, jessReplies: 1600, seen: 1500, calling1: 980, calling2: 980, momCalls: 980, groupChat: 1300, loud: 560, screenTime: 1170, soul: 1400, battery: 1350, clout: 1300, decline: 1250, decline2: 1250, threeAM: 1150, takes5: 1850, soReal: 1000, itWasReal: 900, trending: 1250, refreshEmpty: 1250, emptyLiveOverlay: 1400, deleteApp: 1850, store: 1450, dark: 1150, stopsBuzzing: 1500, limit: 960, sunrise: 900, lockedEnd: 900, endCard: 1500, live1: 1150 });
  SL.FLASH = [[3.6, 0.35], [18.38, 0.4], [26.3, 0.9], [44.96, 1], [51.58, 0.5], [68.08, 0.6], [82.5, 0.6], [99.04, 0.6], [114.88, 1], [137.94, 0.6], [191.97, 1], [203.16, 0.4], [233.8, 0.4]];
  SL.SHAKE = [[44.96, 1.2], [51.58, 0.8], [28.26, 0.4], [68.08, 0.8], [114.88, 1.2], [137.94, 0.8], [191.97, 1.2], [99.04, 0.6]];
  SL.GLITCH = [[24.5, 24.75], [51.3, 51.6], [101.9, 102.2], [102.6, 103.0], [103.84, 104.4], [187.12, 187.4], [190.2, 190.5], [229.4, 229.7]];
})();
