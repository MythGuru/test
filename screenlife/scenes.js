/* TikTok Famous (screen-life): scenes, timeline, captions and edit effects */
(function () {
  const SL = window.SL, UI = SL.UI, U = SL.U, W = SL.W, H = SL.H;
  const D = window.MVDATA;
  const ME = '@mia.exe';

  // ---------------------------------------------------------------- beat + audio helpers
  const BEATS = D.beats, NB = BEATS.length;
  SL.beatPos = t => {
    if (t < BEATS[0]) return (t - BEATS[0]) / 0.47;
    if (t >= BEATS[NB - 1]) return NB - 1 + (t - BEATS[NB - 1]) / 0.466;
    let lo = 0, hi = NB - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (BEATS[m] <= t) lo = m; else hi = m; }
    return lo + (t - BEATS[lo]) / (BEATS[hi] - BEATS[lo]);
  };
  SL.env = (name, t) => { const a = D.env[name], x = t * D.env.fps, i = Math.floor(x), f = x - i; if (i < 0 || i >= a.length - 1) return 0; return (a[i] * (1 - f) + a[i + 1] * f) / 99; };
  SL.kick = t => { let m = 0; for (let k = 0; k < 5; k++) m = Math.max(m, SL.env('kick', t - k / 30) * Math.exp(-k * 0.6)); return m; };
  const pulse = (t, at, len = 0.35) => (t >= at && t < at + len ? Math.sin(Math.PI * (t - at) / len) : 0);
  const pop = (t, at, len = 0.45) => (t < at ? 0 : U.back(U.c01((t - at) / len)));

  // ---------------------------------------------------------------- shared texture: film grain
  const grain = document.createElement('canvas'); grain.width = grain.height = 256;
  (function () { const g = grain.getContext('2d'), id = g.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); })();

  // ---------------------------------------------------------------- scenes: each draws a full phone screen for song time t
  const S = {};
  const bg = (c, col) => { c.fillStyle = col; c.fillRect(0, 0, W, H); };

  // her profile with the post that got 47 likes
  S.likes47 = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '7:04' });
    UI.text(c, ME, W / 2, 200, { size: 46, weight: 700, align: 'center' });
    UI.avatar(c, W / 2, 360, 110, 0);
    UI.text(c, '112 followers', W / 2, 545, { size: 38, weight: 500, color: '#aaa', align: 'center' });
    // her post tile, front and centre
    const k = U.out(U.range(t, 22.19, 22.6));
    const tw = 470, th = 836, tx = (W - tw) / 2, ty = 600 + (1 - k) * 80;
    c.globalAlpha = k;
    UI.video(c, tx, ty, tw, th, t, { seed: 0, label: 'day 1 of trying to go viral', r: 30, slot: 'post1' });
    c.globalAlpha = 1;
    // the like counter climbs to a sad 47
    const n = Math.round(47 * U.out(U.range(t, 22.4, 23.6)));
    const p = pop(t, 22.56);
    c.save(); c.translate(W / 2, 1640); c.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p);
    UI.icon(c, 'heart', -300, -150, 170, '#ff2d55', { shadow: 1 });
    UI.counter(c, String(n), 60, -20, 230, { align: 'center' });
    c.restore();
    // "a total disgrace": the number cracks and the screen sags
    const sag = U.range(t, 24.54, 25.6);
    if (sag > 0) {
      c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 5;
      c.beginPath(); const cx = W / 2 + 60, cy = 1580; c.moveTo(cx - 10, cy - 140);
      const pts = [[cx + 20, cy - 70], [cx - 25, cy - 10], [cx + 30, cy + 40], [cx - 5, cy + 110]];
      pts.slice(0, Math.ceil(sag * pts.length)).forEach(q => c.lineTo(q[0], q[1])); c.stroke();
      c.fillStyle = `rgba(0,0,0,${0.35 * sag})`; c.fillRect(0, 0, W, H);
    }
    // mum is the only one cheering
    const nk = U.out5(U.range(t, 25.05, 25.45)) * (1 - U.range(t, 26.1, 26.3));
    if (nk > 0) UI.notif(c, 30, -200 + nk * 330, W - 60, { title: 'mom ♥ commented', body: 'so proud of you sweetie!!! ♥♥', seed: 4, icon: 'comment' });
  };

  // ring light on: white bloom into the camera
  S.ringOn = (c, t) => {
    bg(c, '#000');
    const on = U.range(t, 26.3, 26.42);
    UI.video(c, 0, 0, W, H, t, { seed: 4, ringLight: true, slot: 'ringlight', vignette: true });
    c.fillStyle = `rgba(0,0,0,${0.8 * (1 - on)})`; c.fillRect(0, 0, W, H);
    // camera UI
    UI.status(c, { time: '7:21' });
    c.beginPath(); c.arc(W / 2, 1700, 92, 0, Math.PI * 2); c.strokeStyle = '#fff'; c.lineWidth = 10; c.stroke();
    c.beginPath(); c.arc(W / 2, 1700, 74, 0, Math.PI * 2); c.fillStyle = '#ff2d55'; c.fill();
    UI.text(c, 'Photo', W / 2 - 230, 1560, { size: 36, weight: 600, color: 'rgba(255,255,255,0.6)', align: 'center' });
    UI.text(c, '15s', W / 2, 1560, { size: 36, weight: 800, align: 'center' });
    UI.text(c, '60s', W / 2 + 230, 1560, { size: 36, weight: 600, color: 'rgba(255,255,255,0.6)', align: 'center' });
    ['camera', 'sparkle', 'star'].forEach((ic, i) => UI.icon(c, ic, 960, 230 + i * 150, 64, '#fff', { shadow: 1 }));
  };

  // retake number 12: drafts pile up
  S.drafts = (c, t) => {
    bg(c, '#0b0b0d');
    UI.status(c, { time: '7:48' });
    UI.text(c, 'Drafts', W / 2, 200, { size: 50, weight: 800, align: 'center' });
    const cols = 3, tw = 330, th = 440, gap = 18, ox = (W - cols * tw - (cols - 1) * gap) / 2;
    for (let i = 0; i < 12; i++) {
      const at = 27.62 + i * 0.05, k = U.back(U.range(t, at, at + 0.28));
      if (k <= 0) continue;
      const col = i % cols, row = Math.floor(i / cols);
      const x = ox + col * (tw + gap), y = 280 + row * (th + gap);
      c.save(); c.translate(x + tw / 2, y + th / 2); c.scale(k, k); c.translate(-tw / 2, -th / 2);
      UI.video(c, 0, 0, tw, th, t, { seed: i % 3 === 0 ? 0 : 4, r: 18, vignette: true });
      UI.text(c, 'Take ' + (i + 1), 22, th - 26, { size: 34, weight: 800, shadow: 'rgba(0,0,0,0.6)' });
      if (i === 11) { UI.box(c, 0, 0, tw, th, 18, null, '#ff2d55', 10); UI.box(c, tw - 110, 18, 92, 48, 24, '#ff2d55'); UI.text(c, 'NEW', tw - 64, 53, { size: 28, weight: 800, align: 'center' }); }
      c.restore();
    }
    const big = pop(t, 28.26, 0.3);
    if (big > 0) UI.counter(c, '#12', W / 2, 1260, 300 * big, { color: '#fff', stroke: '#ff2d55', lw: 18 });
  };

  // smile like I'm happy, put a filter on myself
  const FILTERS = ['Natural', 'Glow', 'Doll', 'Flawless', 'Happy :)', 'Perfect'];
  S.filter = (c, t) => {
    bg(c, '#000');
    const fi = Math.min(FILTERS.length - 1, Math.max(0, Math.floor((t - 28.58) / 0.3)));
    UI.video(c, 0, 0, W, H, t, { seed: [4, 0, 6, 1, 5, 2][fi], ringLight: true, slot: 'selfie' });
    // beauty sparkles once the filter lands
    const sp = U.range(t, 29.6, 29.9);
    for (let i = 0; i < 26 * sp; i++) {
      const x = W * U.hash(i * 3.1), y = H * 0.15 + H * 0.5 * U.hash(i * 7.7), s = 18 + 30 * U.hash(i), tw = 0.5 + 0.5 * Math.sin(t * 9 + i);
      c.globalAlpha = tw; UI.icon(c, 'sparkle', x - s / 2, y - s / 2, s, '#fff'); c.globalAlpha = 1;
    }
    UI.status(c, { time: '7:52' });
    // filter carousel
    FILTERS.forEach((f, i) => {
      const d = i - (fi + U.out(U.c01(((t - 28.58) % 0.3) / 0.15))) + 1, x = W / 2 + d * 230;
      const on = Math.abs(d) < 0.5;
      c.beginPath(); c.arc(x, 1700, on ? 96 : 70, 0, Math.PI * 2); c.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.25)'; c.fill();
      UI.text(c, f, x, 1580, { size: on ? 40 : 32, weight: on ? 800 : 600, align: 'center', color: on ? '#fff' : 'rgba(255,255,255,0.7)', shadow: 'rgba(0,0,0,0.5)' });
    });
    // a sticker that lies
    const st = pop(t, 29.28, 0.35);
    if (st > 0) { c.save(); c.translate(W / 2, 720); c.rotate(-0.08); c.scale(st, st); UI.box(c, -300, -80, 600, 140, 30, '#fff'); UI.text(c, 'so happy rn :)', 0, 20, { size: 66, weight: 900, font: UI.F_CAP, color: '#111', align: 'center' }); c.restore(); }
  };

  // fifteen seconds, that's the whole career
  S.fifteen = (c, t) => {
    bg(c, '#000');
    UI.video(c, 0, 0, W, H, t, { seed: 5, ringLight: true, slot: 'selfie' });
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 0, W, H);
    UI.status(c, { time: '7:55' });
    const k = U.range(t, 30.5, 32.3);
    const n = Math.max(0, 15 - Math.floor((t - 30.5) / ((32.3 - 30.5) / 15)));
    c.beginPath(); c.arc(W / 2, 900, 300, 0, Math.PI * 2); c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 30; c.stroke();
    c.beginPath(); c.arc(W / 2, 900, 300, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); c.strokeStyle = '#ff2d55'; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt';
    UI.counter(c, String(n), W / 2, 985, 260);
    UI.text(c, 'seconds', W / 2, 1110, { size: 54, weight: 800, font: UI.F_CAP, align: 'center' });
    const rec = Math.sin(t * 8) > 0;
    if (rec) { c.beginPath(); c.arc(90, 230, 18, 0, Math.PI * 2); c.fillStyle = '#ff2d55'; c.fill(); }
    UI.text(c, 'REC', 124, 245, { size: 40, weight: 800 });
  };

  // a stranger's feed, and the teacher keeps calling
  S.teacher = (c, t) => {
    UI.feedPost(c, t, { user: '@sk8rjay', caption: 'pov: it’s monday and you forgot the essay', likes: 24800, comments: 412, saves: 1200, shares: 340, seed: 1, avatarSeed: 3, label: 'pov: monday' });
    UI.status(c, { time: '10:17' });
    const a = U.out5(U.range(t, 32.4, 32.75)), b = U.out5(U.range(t, 33.35, 33.65)), out = U.inOut(U.range(t, 33.95, 34.3));
    if (a > 0) UI.notif(c, 30 - out * 1100, -200 + a * 330, W - 60, { title: 'Ms. Harper · Homeroom', body: 'Mia? Phones away, please.', seed: 1, icon: 'msg', iconA: '#30d158', iconB: '#00a86b' });
    if (b > 0) UI.notif(c, 30 - out * 1100, -200 + b * 520, W - 60, { title: 'Ms. Harper · Homeroom', body: 'MIA.', seed: 1, icon: 'msg', iconA: '#30d158', iconB: '#00a86b' });
  };

  // phone in my lap, underneath the desk: brightness all the way down
  S.lap = (c, t) => {
    UI.feedPost(c, t, { user: ME, caption: 'day 1 of trying to go viral #fyp #foryou', likes: 47, comments: 1, saves: 0, shares: 0, seed: 0, avatarSeed: 0, label: 'day 1 of trying to go viral', slot: 'post1' });
    UI.status(c, { time: '10:21' });
    const dim = U.range(t, 34.4, 35.3);
    c.fillStyle = `rgba(0,0,0,${0.62 * dim})`; c.fillRect(0, 0, W, H);
    // control-centre brightness slider sliding down
    const show = U.env(t, 34.34, 36.1, 0.2, 0.3);
    if (show > 0) {
      c.globalAlpha = show;
      UI.box(c, 820, 300, 170, 520, 60, 'rgba(60,60,67,0.85)');
      const lvl = 1 - 0.92 * dim;
      c.save(); UI.rr(c, 820, 300, 170, 520, 60); c.clip(); c.fillStyle = '#fff'; c.fillRect(820, 300 + 520 * (1 - lvl), 170, 520 * lvl); c.restore();
      UI.text(c, '☀', 905, 770, { size: 70, align: 'center', color: '#888' });
      c.globalAlpha = 1;
    }
  };

  // refresh, refresh
  S.refresh = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '10:24' });
    const pulls = [36.18, 36.56, 37.32];
    let pull = 0; for (const p of pulls) pull = Math.max(pull, pulse(t, p, 0.36));
    c.save(); c.translate(0, pull * 190);
    UI.text(c, 'Activity', W / 2, 200, { size: 48, weight: 800, align: 'center' });
    const rows = [['@mom.ofmia', 'liked your video', 4], ['@mom.ofmia', 'commented: so proud!!', 4], ['@jaylen_k', 'liked your video', 2]];
    rows.forEach(([u, what, s], i) => { const y = 330 + i * 150; UI.avatar(c, 110, y, 52, s); UI.text(c, u, 190, y - 6, { size: 38, weight: 700 }); UI.text(c, what, 190, y + 42, { size: 34, weight: 400, color: '#aaa' }); });
    UI.text(c, 'That’s all for now', W / 2, 860, { size: 36, weight: 500, color: '#666', align: 'center' });
    c.restore();
    // spinner
    if (pull > 0.05) { c.save(); c.translate(W / 2, 130 + pull * 90); c.rotate(t * 12); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.globalAlpha = (i + 1) / 8; UI.box(c, -5, -34, 10, 22, 5, '#fff'); } c.restore(); c.globalAlpha = 1; }
    const n = t < 36.6 ? 47 : 48;
    UI.counter(c, '♥ ' + n, W / 2, 1300, 150, { color: '#fff' });
  };

  // like it, share it, save it, stay
  S.actions = (c, t) => {
    const p = { heart: pulse(t, 38.16, 0.5), share: pulse(t, 38.7, 0.5), bookmark: pulse(t, 39.24, 0.5) };
    UI.feedPost(c, t, { user: ME, caption: 'day 1 of trying to go viral #fyp #foryou', likes: 48, comments: 1, saves: t > 39.24 ? 1 : 0, shares: t > 38.7 ? 1 : 0, liked: t > 38.16, saved: t > 39.24, seed: 0, avatarSeed: 0, label: 'day 1 of trying to go viral', slot: 'post1', pop: p });
    UI.status(c, { time: '10:26' });
    const items = [[38.16, 'heart', '#ff2d55', 'LIKE'], [38.7, 'share', '#fff', 'SHARE'], [39.24, 'bookmark', '#ffc400', 'SAVE'], [39.64, 'plus', '#fff', 'FOLLOW']];
    for (const [at, ic, col, word] of items) {
      const k = U.range(t, at, at + 0.5);
      if (k <= 0 || k >= 1) continue;
      const s = 380 * U.back(U.c01(k * 2.2)) * (1 - U.range(k, 0.7, 1));
      c.globalAlpha = 1 - U.range(k, 0.75, 1);
      if (ic === 'plus') { UI.box(c, W / 2 - s * 0.9, 760 - s * 0.32, s * 1.8, s * 0.64, s * 0.32, '#ff2d55'); UI.text(c, 'Follow', W / 2, 760 + s * 0.12, { size: s * 0.3, weight: 900, font: UI.F_CAP, align: 'center' }); }
      else UI.icon(c, ic, W / 2 - s / 2, 760 - s / 2, s, col, { shadow: 1 });
      c.globalAlpha = 1;
    }
  };

  // don't you dare scroll past me: the post refuses to be swiped away
  S.noScroll = (c, t) => {
    const tries = [40.22, 40.69, 41.16];
    let off = 0; for (const a of tries) { const k = U.range(t, a, a + 0.42); if (k > 0 && k < 1) off = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (k < 0.62 ? 1 : 0) * 0.28 + (k >= 0.62 ? 0 : 0); }
    const y = -off * H;
    c.save(); c.translate(0, y);
    UI.feedPost(c, t, { user: ME, caption: 'day 1 of trying to go viral #fyp #foryou', likes: 48, comments: 1, saves: 1, shares: 1, liked: true, saved: true, seed: 0, avatarSeed: 0, label: 'don’t you dare', slot: 'post1' });
    c.translate(0, H);
    UI.feedPost(c, t, { user: '@glowupgabby', caption: 'grwm for a date that’s not happening', likes: 98100, comments: 2210, saves: 5400, shares: 1300, seed: 6, avatarSeed: 5, label: 'grwm' });
    c.restore();
    UI.status(c, { time: '10:27' });
    // a finger drags up, then lets go
    for (const a of tries) { const k = U.range(t, a, a + 0.42); if (k > 0 && k < 1) { const fy = 1500 - 520 * Math.sin(Math.PI * Math.min(1, k * 1.6)); c.globalAlpha = 0.85 * Math.sin(Math.PI * k); c.beginPath(); c.arc(W / 2 + 120, fy, 60, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill(); c.globalAlpha = 1; } }
  };

  // hold on... wait for it: posting stalls at 99%
  S.holdOn = (c, t) => {
    bg(c, '#000');
    UI.status(c, { time: '10:29' });
    const z = 1 + 0.12 * U.range(t, 41.96, 44.9);
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    UI.video(c, 240, 420, 600, 860, t, { seed: 0, label: 'day 2. no filter. just me.', r: 30, slot: 'post2' });
    const pct = t < 44.55 ? Math.min(99, Math.round(60 + 39 * U.out(U.range(t, 41.96, 43.0)))) : 100;
    UI.text(c, pct < 100 ? 'Posting… ' + pct + '%' : 'Posted!', W / 2, 1410, { size: 56, weight: 800, align: 'center' });
    UI.box(c, 190, 1460, 700, 18, 9, 'rgba(255,255,255,0.18)');
    UI.box(c, 190, 1460, 700 * pct / 100, 18, 9, pct < 100 ? '#fff' : '#30d158');
    c.restore();
  };

  // the drop: notification avalanche and a counter that explodes
  const NAMES = ['@zoe.w', '@kayla_m', '@its.dev', '@noah.k', '@bri.xo', '@luca_v', '@ana.b', '@marcus', '@tay.lr', '@sam_s', '@juju', '@rory.j', '@ella.ok', '@mateo', '@priya', '@leo.x'];
  const VERBS = ['liked your video', 'started following you', 'shared your video', 'commented: OMG', 'commented: queen ♥', 'liked your video', 'started following you', 'commented: how is this so real'];
  S.famous = (c, t) => {
    bg(c, '#000');
    const wall = c.createLinearGradient(0, 0, W, H); wall.addColorStop(0, '#2a0b3d'); wall.addColorStop(1, '#0b1d3d'); c.fillStyle = wall; c.fillRect(0, 0, W, H);
    UI.status(c, { time: '10:31' });
    const k = U.range(t, 44.96, 48.4);
    const n = t < 44.96 ? 48 : Math.round(48 + Math.pow(k, 2.2) * 1240000);
    const p = pop(t, 44.96, 0.4);
    UI.text(c, 'followers', W / 2, 250, { size: 44, weight: 700, align: 'center', color: '#ddd' });
    UI.counter(c, U.fmt(n), W / 2, 450, 190 * (0.7 + 0.3 * p), { color: '#fff' });
    // cascade of notifications, faster and faster
    c.save(); UI.rr(c, 0, 520, W, H - 520, 0); c.clip();
    const rate = 4 + 26 * k, total = Math.floor((t - 44.9) * (4 + 13 * k));
    for (let i = Math.max(0, total - 9); i <= total; i++) {
      const age = (t - 44.9) - i / (4 + 13 * k);
      const y = 560 + (total - i) * 190 + 190 * U.out5(U.c01(1 - age * rate * 0.25)) * -0.0;
      if (y > H) continue;
      UI.notif(c, 30, y, W - 60, { title: NAMES[i % NAMES.length], body: VERBS[(i * 3) % VERBS.length], seed: i, icon: i % 3 === 1 ? 'user' : i % 3 === 2 ? 'comment' : 'heart', when: 'now' });
    }
    c.restore();
  };

  // riding the algo: the feed flies by, and it's her every other swipe
  S.algo = (c, t) => {
    const bp = SL.beatPos(t), i = Math.floor(bp), f = bp - i;
    const sw = U.inOut(U.c01(f / 0.32));
    const post = j => j % 2 === 0
      ? { user: ME, verified: j > 2, caption: 'day 2. no filter. just me. #fyp', likes: 380000 + j * 91000, comments: 12400, saves: 30200, shares: 18100, seed: 0, avatarSeed: 0, label: 'day 2. no filter. just me.', slot: 'post2', liked: true }
      : { user: NAMES[j % NAMES.length], caption: 'stitch with ' + ME + ' this is literally me', likes: 54000 + j * 3000, comments: 800, saves: 2100, shares: 900, seed: (j % 6) + 1, avatarSeed: j, label: 'this is literally me' };
    c.save(); c.translate(0, -sw * H); UI.feedPost(c, t, post(i)); c.translate(0, H); UI.feedPost(c, t, post(i + 1)); c.restore();
    UI.status(c, { time: '10:34' });
    // trend line overlay
    const k = U.range(t, 48.58, 51.5);
    c.save(); UI.box(c, 60, 270, 600, 330, 34, 'rgba(0,0,0,0.55)');
    UI.text(c, 'Views', 100, 335, { size: 34, weight: 600, color: '#bbb' });
    UI.text(c, '↑ ' + Math.round(1200 + 98000 * Math.pow(k, 2)).toLocaleString('en-US') + '%', 100, 400, { size: 52, weight: 900, color: '#30d158' });
    c.beginPath(); c.moveTo(100, 560);
    for (let s = 0; s <= 40 * k; s++) { const u = s / 40; c.lineTo(100 + u * 520, 560 - Math.pow(u, 3) * 140 - Math.sin(u * 20) * 6); }
    c.strokeStyle = '#30d158'; c.lineWidth = 8; c.lineJoin = 'round'; c.stroke();
    c.restore();
  };

  // nobody can tame this: verified, one million
  S.million = (c, t) => {
    UI.feedPost(c, t, { user: ME, verified: true, caption: 'day 2. no filter. just me. #fyp', likes: 1000000, comments: 48200, saves: 120000, shares: 76000, seed: 0, avatarSeed: 0, label: 'day 2. no filter. just me.', slot: 'post2', liked: true, pop: { heart: pulse(t, 51.58, 0.5) } });
    UI.status(c, { time: '10:36' });
    const p = pop(t, 51.58, 0.35);
    if (p > 0) { c.save(); c.translate(W / 2, 820); c.rotate(-0.06); c.scale(p, p); UI.counter(c, '1M', 0, 120, 380, { stroke: '#ff2d55', lw: 26 }); c.restore(); }
  };

  // ---------------------------------------------------------------- timeline: [start, scene, transition into it]
  SL.TIMELINE = [
    [0, 'likes47', 'cut'],
    [26.3, 'ringOn', 'flash'],
    [27.62, 'drafts', 'swipe'],
    [28.58, 'filter', 'zoom'],
    [30.5, 'fifteen', 'swipe'],
    [32.15, 'teacher', 'swipe'],
    [34.3, 'lap', 'zoom'],
    [36.12, 'refresh', 'swipe'],
    [38.05, 'actions', 'swipe'],
    [40.04, 'noScroll', 'cut'],
    [41.9, 'holdOn', 'zoom'],
    [44.96, 'famous', 'flash'],
    [48.55, 'algo', 'swipe'],
    [51.4, 'million', 'zoom'],
    [52.56, 'likes47', 'cut'],
  ];
  SL.SCENES = S;
  // where the lyric captions sit in each scene (default 1060)
  SL.CAPY = { likes47: 1850, holdOn: 1700, fifteen: 1420, refresh: 1080 };
  SL.FLASH = [[26.3, 0.9], [44.96, 1], [51.58, 0.5]];
  SL.SHAKE = [[44.96, 1.2], [51.58, 0.8], [28.26, 0.4]];
  SL.GLITCH = [[24.5, 24.75], [51.3, 51.6]];
  SL.grain = grain;
})();
