/* TikTok Famous (screen-life): compositor, captions, player and capture */
(function () {
  const SL = window.SL, UI = SL.UI, U = SL.U, W = SL.W, H = SL.H;
  const D = window.MVDATA;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const A = mk(W, H), B = mk(W, H), FR = mk(W, H), small = mk(54, 96);
  const ca = A.getContext('2d'), cb = B.getContext('2d'), cf = FR.getContext('2d'), cs = small.getContext('2d');

  // ---------------------------------------------------------------- scene lookup + transitions
  const TR = { cut: 0, flash: 0.08, swipe: 0.3, zoom: 0.32 };
  function sceneAt(t) { const L = SL.TIMELINE; let i = 0; while (i < L.length - 1 && L[i + 1][0] <= t) i++; return i; }
  function drawScene(c, i, t) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); SL.SCENES[SL.TIMELINE[i][1]](c, t); c.restore(); }

  function composeScreen(t) {
    const L = SL.TIMELINE;
    let i = sceneAt(t);
    // a transition straddles each scene start
    let mode = null, k = 1, prev = i;
    const nx = L[i + 1];
    if (nx && TR[nx[2]] && t > nx[0] - TR[nx[2]] / 2) { prev = i; i = i + 1; mode = nx[2]; k = U.range(t, nx[0] - TR[mode] / 2, nx[0] + TR[mode] / 2); }
    else if (TR[L[i][2]] && i > 0 && t < L[i][0] + TR[L[i][2]] / 2) { prev = i - 1; mode = L[i][2]; k = U.range(t, L[i][0] - TR[mode] / 2, L[i][0] + TR[mode] / 2); }
    cf.setTransform(1, 0, 0, 1, 0, 0); cf.fillStyle = '#000'; cf.fillRect(0, 0, W, H);
    if (!mode || mode === 'cut' || mode === 'flash') {
      const idx = mode === 'flash' && k < 0.5 ? prev : i;
      drawScene(ca, idx, t); cf.drawImage(A, 0, 0);
    } else {
      drawScene(ca, prev, t); drawScene(cb, i, t);
      const e = U.inOut(k);
      if (mode === 'swipe') {
        cf.drawImage(A, 0, -e * H); cf.drawImage(B, 0, (1 - e) * H);
      } else if (mode === 'zoom') {
        cf.save(); cf.globalAlpha = 1 - e; cf.translate(W / 2, H / 2); cf.scale(1 + 0.18 * e, 1 + 0.18 * e); cf.drawImage(A, -W / 2, -H / 2); cf.restore();
        cf.save(); cf.globalAlpha = e; cf.translate(W / 2, H / 2); cf.scale(0.9 + 0.1 * e, 0.9 + 0.1 * e); cf.drawImage(B, -W / 2, -H / 2); cf.restore();
      }
    }
    return FR;
  }

  // ---------------------------------------------------------------- captions (word by word, current word highlighted)
  SL.captions = true;
  function captions(c, t, x0, y0, scale) {
    if (!SL.captions) return;
    const Lyr = D.lyrics.find(l => t >= l.s - 0.05 && t <= l.e + 0.35);
    if (!Lyr) return;
    const ws = Lyr.w;
    let cur = 0; for (let j = 0; j < ws.length; j++) if (t >= ws[j][0]) cur = j;
    // show the current chunk of up to 3 words
    const start = Math.floor(cur / 3) * 3, chunk = ws.slice(start, start + 3);
    let size = 92 * scale;
    const words = chunk.map(w => w[1].toUpperCase().replace(/[.,]+$/, ''));
    c.font = `900 ${size}px ${UI.F_CAP}`;
    let sp = size * 0.28, widths = words.map(w => c.measureText(w).width);
    // shrink long chunks so they always fit inside the screen
    const full = widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1), fit = Math.min(1, 940 / full);
    if (fit < 1) { size *= fit; sp *= fit; widths = widths.map(w => w * fit); }
    const shown = words.filter((w, j) => t >= ws[start + j][0]).length;
    const total = widths.slice(0, shown).reduce((a, b) => a + b, 0) + sp * Math.max(0, shown - 1);
    let x = x0 - total / 2;
    const fade = 1 - U.range(t, Lyr.e + 0.15, Lyr.e + 0.35);
    words.forEach((w, j) => {
      const wi = start + j, at = ws[wi][0], active = wi === cur && t < (ws[wi + 1] ? ws[wi + 1][0] : Lyr.e + 0.1), sung = t >= at;
      if (!sung) { x += widths[j] + sp; return; }
      const p = U.back(U.c01((t - at) / 0.18));
      c.save(); c.globalAlpha = fade; c.translate(x + widths[j] / 2, y0); c.scale(p * (active ? 1.08 : 1), p * (active ? 1.08 : 1)); c.rotate(active ? -0.02 : 0);
      UI.text(c, w, 0, 0, { size, weight: 900, font: UI.F_CAP, align: 'center', color: active ? '#ffe14d' : '#fff', stroke: '#000', lw: size * 0.16, shadow: 'rgba(0,0,0,0.6)', blur: size * 0.3, sy: size * 0.06 });
      c.restore();
      x += widths[j] + sp;
    });
  }

  // ---------------------------------------------------------------- final frame with edit effects
  function fxParams(t) {
    const kick = SL.kick(t), loud = SL.env('loud', t);
    let flash = 0; for (const [at, a] of SL.FLASH) if (t >= at && t < at + 0.5) flash = Math.max(flash, a * Math.exp(-(t - at) * 9));
    let shake = 0; for (const [at, a] of SL.SHAKE) if (t >= at && t < at + 0.6) shake = Math.max(shake, a * Math.exp(-(t - at) * 7));
    let glitch = 0; for (const [a, b] of SL.GLITCH) if (t >= a && t <= b) glitch = 1;
    return { punch: 1 + 0.03 * kick * (0.3 + loud), flash, shake, glitch };
  }
  function drawScreen(c, src, t, x, y, w, h) {
    const f = fxParams(t);
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    const sx = (U.hash(Math.floor(t * 60)) - 0.5) * 40 * f.shake, sy = (U.hash(Math.floor(t * 60) + 9) - 0.5) * 40 * f.shake;
    c.translate(x + w / 2 + sx * w / W, y + h / 2 + sy * w / W); c.scale(f.punch * w / W, f.punch * h / H); c.translate(-W / 2, -H / 2);
    if (f.glitch) {
      for (let s = 0; s < 14; s++) {
        const sy0 = (s / 14) * H, sh = H / 14, off = (U.hash(s + Math.floor(t * 24)) - 0.5) * 120 * (U.hash(s * 3 + Math.floor(t * 12)) > 0.6 ? 1 : 0.1);
        c.drawImage(src, 0, sy0, W, sh, off, sy0, W, sh);
      }
      c.globalCompositeOperation = 'screen'; c.globalAlpha = 0.35; c.drawImage(src, 12, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    } else c.drawImage(src, 0, 0);
    const sc = SL.TIMELINE[sceneAt(t)][1];
    captions(c, t, W / 2, (SL.CAPY && SL.CAPY[sc]) || 1060, 1);
    // grain + flash
    c.globalAlpha = 0.07; c.globalCompositeOperation = 'overlay';
    const gx = -U.hash(Math.floor(t * 30)) * 256, gy = -U.hash(Math.floor(t * 30) + 4) * 256;
    for (let px = gx; px < W; px += 256) for (let py = gy; py < H; py += 256) c.drawImage(SL.grain, px, py);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    if (f.flash > 0) { c.fillStyle = `rgba(255,255,255,${f.flash})`; c.fillRect(0, 0, W, H); }
    c.restore();
  }

  // Render song time t into canvas `out` (9:16 fills it; 16:9 shows the phone frame over a blurred fill).
  SL.render = function (out, t) {
    const c = out.getContext('2d'), ow = out.width, oh = out.height;
    const src = composeScreen(t);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (ow / oh < 0.75) { drawScreen(c, src, t, 0, 0, ow, oh); return; }
    // landscape: blurred backdrop + framed vertical video
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    if ('filter' in c) { c.filter = `blur(${Math.round(oh * 0.04)}px)`; c.drawImage(src, -ow * 0.05, -oh * 0.9, ow * 1.1, ow * 1.1 * H / W); c.filter = 'none'; }
    else { cs.drawImage(src, 0, 0, 54, 96); c.drawImage(small, 0, -oh * 0.4, ow, ow * 96 / 54); }
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, ow, oh);
    // a real handset: titanium frame, black bezel, glass, buttons, soft shadow
    const sh = oh * 0.9, sw = sh * W / H, sx = (ow - sw) / 2, sy = (oh - sh) / 2 + Math.sin(t * 0.6) * oh * 0.004;
    const bz = sh * 0.016, fr = sh * 0.008, rad = sh * 0.075;
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.65)'; c.shadowBlur = oh * 0.08; c.shadowOffsetY = oh * 0.03;
    UI.rr(c, sx - bz - fr, sy - bz - fr, sw + 2 * (bz + fr), sh + 2 * (bz + fr), rad + bz + fr);
    const ti = c.createLinearGradient(sx - bz, sy, sx + sw + bz, sy + sh); ti.addColorStop(0, '#d9d6d0'); ti.addColorStop(0.25, '#8f8b85'); ti.addColorStop(0.5, '#e6e3de'); ti.addColorStop(0.75, '#7d7a75'); ti.addColorStop(1, '#c9c5bf');
    c.fillStyle = ti; c.fill(); c.restore();
    c.fillStyle = '#9a968f';
    UI.rr(c, sx - bz - fr * 2.2, sy + sh * 0.18, fr * 1.6, sh * 0.05, fr * 0.8); c.fill();
    UI.rr(c, sx - bz - fr * 2.2, sy + sh * 0.26, fr * 1.6, sh * 0.09, fr * 0.8); c.fill();
    UI.rr(c, sx - bz - fr * 2.2, sy + sh * 0.37, fr * 1.6, sh * 0.09, fr * 0.8); c.fill();
    UI.rr(c, sx + sw + bz + fr * 0.6, sy + sh * 0.29, fr * 1.6, sh * 0.14, fr * 0.8); c.fill();
    UI.rr(c, sx - bz, sy - bz, sw + 2 * bz, sh + 2 * bz, rad + bz); c.fillStyle = '#050506'; c.fill();
    c.save(); UI.rr(c, sx, sy, sw, sh, rad); c.clip();
    drawScreen(c, src, t, sx, sy, sw, sh);
    const gl = c.createLinearGradient(sx, sy, sx + sw, sy + sh * 0.6); gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(0.35, 'rgba(255,255,255,0.02)'); gl.addColorStop(0.36, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gl; c.fillRect(sx, sy, sw, sh);
    c.restore();
    UI.rr(c, sx - bz - fr * 0.5, sy - bz - fr * 0.5, sw + 2 * bz + fr, sh + 2 * bz + fr, rad + bz + fr * 0.5); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = fr * 0.4; c.stroke();
  };
})();
