/* TikTok Famous: player (render loop, audio clock, lyrics, controls, capture) */
(function () {
  const MV = window.MV, U = MV.U;
  const $ = id => document.getElementById(id);
  const stage = $('stage'), glCanvas = $('gl'), lyr = $('lyrics'), lx = lyr.getContext('2d');
  const audio = $('song');
  const DUR = window.MVDATA.dur;
  const params = new URLSearchParams(location.search);
  const CAPTURE = params.has('capture');
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));

  function fail(msg) { $('loading').hidden = true; $('error').hidden = false; $('error').textContent = msg; }
  if (!window.THREE || !THREE.EffectComposer || !THREE.UnrealBloomPass) { fail('The 3D engine did not load. Check your connection and reload the page.'); return; }

  let renderer;
  try { renderer = MV.initRenderer(glCanvas, { capture: CAPTURE }); }
  catch (e) { fail('This device could not start WebGL, which the video needs. Turn on hardware acceleration or try another browser.'); return; }
  if (isMobile) MV.world.KEY_SHADOW = 1024;

  // ---------------------------------------------------------------- scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0c10);
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.2, 600);
  camera.layers.enable(MV.L_SCREEN);
  const feedCam = new THREE.PerspectiveCamera(46, 288 / 512, 0.2, 400);
  MV.renderPass.scene = scene; MV.renderPass.camera = camera;

  MV.world.build(scene);
  if (isMobile) MV.world.key.shadow.mapSize.set(1024, 1024);
  MV.fx.build(scene);
  const girl = MV.chars.makeGirl(), dog = MV.chars.makeDog();
  MV.story.build(scene, girl, dog);
  scene.traverse(o => { if (o.isLight) o.layers.enableAll(); });
  // the feed shows on the floating screens and both phones
  MV.world.deskPhone.userData.screen.material = new THREE.MeshBasicMaterial({ map: MV.fx.feedRT.texture, toneMapped: false });
  MV.world.deskPhone.userData.screen.material.color.setScalar(1.5);
  MV.world.ringPhone.userData.screen.material = MV.world.deskPhone.userData.screen.material;
  // studio environment for reflections: a dark room with a soft box, the ring light and a cool window
  (function () {
    const env = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(120, 70, 120), new THREE.MeshBasicMaterial({ color: 0x15161b, side: THREE.BackSide }));
    env.add(box);
    const panel = (w, h, col, k, pos, look) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(...look); env.add(m); };
    panel(46, 30, 0xffffff, 2.2, [0, 34, 0], [0, 0, 0]);
    panel(70, 16, 0x8fb4ff, 0.9, [0, 18, -59], [0, 10, 0]);
    panel(30, 50, 0xffe2c2, 0.6, [-59, 20, 10], [0, 10, 0]);
    panel(120, 120, 0x3a2a1e, 0.6, [0, -34, 0], [0, 0, 0]);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 1.6, 12, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1df).multiplyScalar(4) }));
    ring.position.set(26, 18, 24); ring.lookAt(0, 6, 0); env.add(ring);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.02).texture;
    MV.envMats = [];
    scene.traverse(o => { if (o.isMesh && o.material && (o.material.isMeshStandardMaterial)) { const m = o.material; if (!m.userData.envBase) { m.userData.envBase = m.isMeshPhysicalMaterial ? 0.9 : 0.55; MV.envMats.push(m); } } });
  })();
  scene.updateMatrixWorld(true);

  // desk phone UI overlay
  const uiC = MV.canvas(288, 600), ui = uiC.getContext('2d'), uiTex = MV.tex(uiC);
  MV.world.deskPhone.userData.ui.material.map = uiTex; MV.world.deskPhone.userData.ui.material.needsUpdate = true;
  function followers(t) {
    const k = [[0, 112], [44.9, 140], [52.7, 98000], [64.8, 1000000], [114.9, 1400000], [134.7, 10000000], [151, 10200000], [175.4, 300000], [181.7, 300000], [191.97, 320000], [211.7, 1000000], [246.8, 1100000]];
    let i = 0; while (i < k.length - 1 && k[i + 1][0] <= t) i++;
    const a = k[i], b = k[Math.min(i + 1, k.length - 1)], f = b[0] > a[0] ? U.c01((t - a[0]) / (b[0] - a[0])) : 0;
    return Math.round(U.lerp(a[1], b[1], f));
  }
  const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K' : String(n);
  let uiLast = '';
  function drawPhoneUI(t) {
    const likes = t < 26 ? 47 : Math.round(followers(t) * 0.31);
    const key = fmt(followers(t)) + '|' + fmt(likes) + '|' + Math.floor(t * 4);
    if (key === uiLast) return; uiLast = key;
    ui.clearRect(0, 0, 288, 600);
    const g = ui.createLinearGradient(0, 380, 0, 600); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.65)');
    ui.fillStyle = g; ui.fillRect(0, 380, 288, 220);
    ui.fillStyle = '#fff'; ui.font = "600 20px 'Poppins', Arial, sans-serif"; ui.fillText('@pencilgirl', 18, 528);
    ui.font = "400 15px 'Poppins', Arial, sans-serif"; ui.fillText('day 1 of trying to go viral ✨', 18, 554);
    ui.font = "700 15px 'Poppins', Arial, sans-serif"; ui.fillText(fmt(followers(t)) + ' followers', 18, 578);
    const side = [['♥', fmt(likes)], ['✉', fmt(Math.round(likes * 0.04))], ['➦', fmt(Math.round(likes * 0.02))]];
    side.forEach(([ic, n], i) => { ui.textAlign = 'center'; ui.font = "700 30px Arial"; ui.fillStyle = i === 0 ? '#ff3d6f' : '#fff'; ui.fillText(ic, 252, 330 + i * 70); ui.font = "600 13px 'Poppins', Arial"; ui.fillStyle = '#fff'; ui.fillText(n, 252, 352 + i * 70); ui.textAlign = 'left'; });
    uiTex.needsUpdate = true;
  }

  // ---------------------------------------------------------------- lyrics (2D overlay, also burned into captures)
  let lyricsOn = true;
  function drawLyrics(ctx, t, W, H, frameW) {
    ctx.clearRect(0, 0, W, H);
    if (!lyricsOn) return;
    const L = MV.lyrics.find(l => t >= l.s - 0.25 && t <= l.e + 0.55);
    if (!L) return;
    const fin = U.c01((t - (L.s - 0.25)) / 0.25), fout = 1 - U.c01((t - L.e - 0.25) / 0.3);
    const alpha = Math.min(fin, fout);
    const size = Math.round(Math.min(W, H) * (W > H ? 0.046 : 0.052));
    ctx.font = `700 ${size}px 'Poppins', 'Helvetica Neue', Arial, sans-serif`;
    ctx.textBaseline = 'alphabetic';
    // wrap into lines that fit
    const maxW = (W - frameW * 2) * 0.86, space = ctx.measureText(' ').width;
    const lines = [[]]; let lw = 0;
    L.w.forEach((w, i) => { const ww = ctx.measureText(w[1]).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ i, text: w[1], ww, t: w[0] }); lw += ww + space; });
    const lineH = size * 1.25, baseY = H - frameW - size * (W > H ? 1.2 : 3.2) - (lines.length - 1) * lineH;
    const rise = (1 - U.out3(fin)) * size * 0.4;
    ctx.save(); ctx.globalAlpha = alpha;
    lines.forEach((ln, li) => {
      const total = ln.reduce((a, w) => a + w.ww, 0) + space * (ln.length - 1);
      let x = W / 2 - total / 2; const y = baseY + li * lineH + rise;
      ln.forEach(w => {
        const next = L.w[w.i + 1] ? L.w[w.i + 1][0] : L.e;
        const sung = t >= w.t, active = t >= w.t && t < next;
        const pop = active ? 1 + 0.08 * Math.sin(Math.PI * U.c01((t - w.t) / 0.25)) : 1;
        ctx.save(); ctx.translate(x + w.ww / 2, y); ctx.scale(pop, pop);
        ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = size * 0.35; ctx.shadowOffsetY = size * 0.06;
        ctx.lineWidth = size * 0.12; ctx.strokeStyle = 'rgba(10,8,14,0.55)'; ctx.lineJoin = 'round';
        ctx.textAlign = 'center';
        ctx.strokeText(w.text, 0, 0);
        ctx.shadowColor = active ? 'rgba(255,61,139,0.95)' : 'rgba(0,0,0,0.6)';
        ctx.fillStyle = sung ? '#ffffff' : 'rgba(255,255,255,0.42)';
        ctx.fillText(w.text, 0, 0);
        ctx.restore();
        x += w.ww + space;
      });
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- sizing
  let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5), W = 1, H = 1, frameW = 0, forced = null;
  function layout() {
    const r = stage.getBoundingClientRect();
    let w = r.width, h = r.height;
    if (forced) { const a = forced.w / forced.h; if (w / h > a) w = h * a; else h = w / a; }
    glCanvas.style.width = lyr.style.width = w + 'px';
    glCanvas.style.height = lyr.style.height = h + 'px';
    W = Math.round(w * dpr); H = Math.round(h * dpr);
    MV.resize(w, h, dpr);
    lyr.width = W; lyr.height = H;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    frameW = MV.post.frame.value.x;
    MV.fx.sparkMat.uniforms.uPx.value = H / 900;
    dirty = true;
  }
  let dirty = true;
  new ResizeObserver(layout).observe(stage);
  window.addEventListener('orientationchange', () => setTimeout(layout, 300));

  // ---------------------------------------------------------------- render one frame at song time t
  let feedTick = 0;
  function renderAt(t, forceFeed) {
    MV.post.time.value = t;
    MV.story.update(t, camera, camera.aspect);
    drawPhoneUI(t);
    scene.updateMatrixWorld();
    renderer.shadowMap.needsUpdate = true;
    // live feed from the phone in the ring light
    if (forceFeed || (feedTick++ % 2 === 0)) {
      MV.world.ringPhone.getWorldPosition(feedCam.position);
      feedCam.lookAt(MV.story.head.x, MV.story.head.y - 1.2, MV.story.head.z);
      feedCam.layers.set(0);
      renderer.setRenderTarget(MV.fx.feedRT);
      renderer.setClearColor(0x101014, 1); renderer.clear();
      renderer.render(scene, feedCam);
    }
    // pop-out layer: things that break out of the frame
    const bg = scene.background;
    scene.background = null;
    camera.layers.set(MV.L_POP);
    renderer.setRenderTarget(MV.popRT);
    renderer.setClearColor(0x000000, 0); renderer.clear();
    renderer.render(scene, camera);
    scene.background = bg;
    camera.layers.set(0); camera.layers.enable(MV.L_SCREEN);
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, 1);
    MV.composer.render();
    if (CAPTURE || $('poster').hidden) drawLyrics(lx, t, W, H, frameW); else lx.clearRect(0, 0, W, H);
  }

  // ---------------------------------------------------------------- audio clock
  let playing = false, clockBase = 0, clockStamp = 0, seekT = 69.9;
  function now() { return performance.now() / 1000; }
  function songTime() {
    if (!playing) return seekT;
    const pred = clockBase + (now() - clockStamp);
    const at = audio.currentTime;
    if (Math.abs(pred - at) > 0.12) { clockBase = at; clockStamp = now(); return at; }
    return pred;
  }
  audio.addEventListener('playing', () => { clockBase = audio.currentTime; clockStamp = now(); });
  audio.addEventListener('seeked', () => { clockBase = audio.currentTime; clockStamp = now(); MV.story.resetInk(); });
  audio.addEventListener('ended', () => { playing = false; seekT = DUR; $('end').hidden = false; setPlayIcon(); });

  function play() {
    $('poster').hidden = true; $('end').hidden = true;
    if (audio.ended || seekT >= DUR - 0.2) { audio.currentTime = 0; seekT = 0; }
    const p = audio.play();
    playing = true; clockBase = audio.currentTime; clockStamp = now();
    if (p && p.catch) p.catch(() => { playing = false; setPlayIcon(); $('status').textContent = 'Tap play to start the sound.'; });
    setPlayIcon(); poke();
  }
  function pause() { audio.pause(); seekT = songTime(); playing = false; setPlayIcon(); poke(); }
  function setPlayIcon() { $('pp').textContent = playing ? 'Pause' : 'Play'; $('pp').setAttribute('aria-label', playing ? 'Pause' : 'Play'); }
  $('start').addEventListener('click', () => { audio.currentTime = 0; seekT = 0; MV.story.resetInk(); play(); });
  $('again').addEventListener('click', () => { audio.currentTime = 0; seekT = 0; MV.story.resetInk(); play(); });
  $('pp').addEventListener('click', () => (playing ? pause() : play()));
  const seek = $('seek');
  seek.max = DUR;
  seek.addEventListener('input', () => { const v = +seek.value; audio.currentTime = v; seekT = v; clockBase = v; clockStamp = now(); MV.story.resetInk(); $('poster').hidden = true; poke(); });
  $('cc').addEventListener('click', () => { lyricsOn = !lyricsOn; $('cc').setAttribute('aria-pressed', lyricsOn); $('cc').classList.toggle('off', !lyricsOn); });
  $('fs').addEventListener('click', () => { const el = document.documentElement; try { if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); } catch (e) {} });
  $('fmt').addEventListener('change', e => { const v = e.target.value; forced = v === 'fill' ? null : v === '169' ? { w: 16, h: 9 } : { w: 9, h: 16 }; layout(); });
  document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); playing ? pause() : play(); } });

  // chapter ticks on the scrubber
  const chapters = [[0, 'Sketch'], [18.4, 'Wake up'], [44.96, 'Chorus'], [82.8, 'Dance break'], [91, 'Verse 2'], [114.88, 'Chorus'], [161.4, '3 a.m.'], [175.4, 'Who am I'], [191.97, 'Final chorus'], [240.5, 'Back to paper']];
  const ticks = $('ticks');
  chapters.forEach(([t, name]) => { const s = document.createElement('span'); s.style.left = (t / DUR * 100) + '%'; s.title = name; ticks.appendChild(s); });
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  // auto-hiding controls
  let hideAt = 0;
  function poke() { document.body.classList.remove('idle'); hideAt = now() + 2.8; }
  ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, poke, { passive: true }));

  // ---------------------------------------------------------------- loop with adaptive resolution
  let frames = 0, acc = 0, last = now();
  function loop() {
    const tn = now(), dt = tn - last; last = tn;
    const t = Math.min(DUR, songTime());
    if (playing || dirty || !$('poster').hidden) {
      renderAt(t);
      dirty = false;
    }
    seek.value = t; $('time').textContent = fmtT(t) + ' / ' + fmtT(DUR);
    const ch = chapters.filter(c => c[0] <= t).pop(); $('chapter').textContent = ch ? ch[1] : '';
    if (playing && now() > hideAt) document.body.classList.add('idle');
    if (playing) {
      acc += dt; frames++;
      if (frames >= 45) {
        const ms = (acc / frames) * 1000; frames = 0; acc = 0;
        const cap = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
        if (ms > 26 && dpr > 0.6) { dpr = Math.max(0.6, dpr - 0.15); layout(); }
        else if (ms < 13 && dpr < cap) { dpr = Math.min(cap, dpr + 0.1); layout(); }
      }
    }
    requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------------- capture API (used offline to render MP4 files)
  MV.capture = {
    setup(w, h) { CAPTURE_SIZE = [w, h]; stage.style.width = w + 'px'; stage.style.height = h + 'px'; dpr = 1; forced = null; layout(); },
    frame(t) {
      renderAt(t, true);
      const out = MV.capture.out || (MV.capture.out = MV.canvas(W, H));
      if (out.width !== W) { out.width = W; out.height = H; }
      const o = out.getContext('2d'); o.drawImage(glCanvas, 0, 0); o.drawImage(lyr, 0, 0);
      return out.toDataURL('image/jpeg', 0.93);
    },
  };
  let CAPTURE_SIZE = null;

  // ---------------------------------------------------------------- boot
  const fontsReady = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load("700 40px 'Kalam'"), document.fonts.load("700 40px 'Poppins'"), document.fonts.load("600 20px 'Poppins'")]).catch(() => {}) : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 2500))]).then(() => {
    layout();
    renderAt(seekT, true);
    $('loading').hidden = true;
    if (CAPTURE) { document.body.classList.add('capture'); window.__ready = true; return; }
    $('poster').hidden = false;
    requestAnimationFrame(loop);
  });
})();
