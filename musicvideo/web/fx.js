/* TikTok Famous: effects (particles, cards, icons, screens, fans, props) */
(function () {
  const MV = window.MV, U = MV.U, TAU = U.TAU;
  const F = (MV.fx = {});
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpE = new THREE.Euler(), tmpC = new THREE.Color();

  // ---------------------------------------------------------------- geometry
  function heartShape(s = 1) {
    const h = new THREE.Shape();
    h.moveTo(0, -0.9 * s);
    h.bezierCurveTo(-1.25 * s, 0.05 * s, -0.9 * s, 1.05 * s, 0, 0.45 * s);
    h.bezierCurveTo(0.9 * s, 1.05 * s, 1.25 * s, 0.05 * s, 0, -0.9 * s);
    return h;
  }
  F.heartGeo = (s = 1, depth = 0.35) => { const g = new THREE.ExtrudeGeometry(heartShape(s), { depth, bevelEnabled: true, bevelThickness: 0.18 * s, bevelSize: 0.16 * s, bevelSegments: 4, curveSegments: 14 }); g.center(); return g; };
  function arrowShape() {
    const a = new THREE.Shape();
    a.moveTo(-0.9, -0.5); a.quadraticCurveTo(-0.6, 0.35, 0.25, 0.35); a.lineTo(0.25, 0.75); a.lineTo(1, 0.05); a.lineTo(0.25, -0.65); a.lineTo(0.25, -0.25);
    a.quadraticCurveTo(-0.45, -0.25, -0.9, -0.5);
    return a;
  }
  function bookmarkShape() {
    const b = new THREE.Shape();
    b.moveTo(-0.55, 0.85); b.lineTo(0.55, 0.85); b.lineTo(0.55, -0.85); b.lineTo(0, -0.42); b.lineTo(-0.55, -0.85); b.lineTo(-0.55, 0.85);
    return b;
  }
  function plusShape() {
    const p = new THREE.Shape(), a = 0.3, b = 0.9;
    p.moveTo(-a, b); p.lineTo(a, b); p.lineTo(a, a); p.lineTo(b, a); p.lineTo(b, -a); p.lineTo(a, -a); p.lineTo(a, -b); p.lineTo(-a, -b); p.lineTo(-a, -a); p.lineTo(-b, -a); p.lineTo(-b, a); p.lineTo(-a, a); p.lineTo(-a, b);
    return p;
  }
  const ext = (shape, d = 0.3) => { const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3, curveSegments: 10 }); g.center(); return g; };

  // ---------------------------------------------------------------- particles (analytic: every particle is a function of time)
  F.emitters = [];
  F.emit = e => F.emitters.push(Object.assign({ rate: 20, life: 2.5, spread: 0.5, speed: 8, grav: -2, size: 1, spin: 2, drag: 0.4, kind: 'heart', pop: true }, e));
  const HEART_COLS = [0xff2d6f, 0xff4f9a, 0xff7ab8, 0xff1744, 0xff9ec7];
  const CONF_COLS = [0xff4f9a, 0x2fd0ff, 0xffd23a, 0x9a6bff, 0x4dff9a, 0xffffff];
  const MAXH = 420, MAXC = 600, MAXS = 1600;

  F.build = function (scene) {
    F.scene = scene;
    const hm = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1, emissive: 0x3a0016, emissiveIntensity: 1 });
    F.hearts = new THREE.InstancedMesh(F.heartGeo(0.5, 0.25), hm, MAXH);
    F.hearts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    F.hearts.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAXH * 3), 3);
    F.hearts.frustumCulled = false; F.hearts.castShadow = true;
    MV.setLayers(F.hearts, true);
    scene.add(F.hearts);

    const cg = new THREE.PlaneGeometry(0.42, 0.26);
    F.confetti = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, side: THREE.DoubleSide, emissive: 0x111111 }), MAXC);
    F.confetti.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    F.confetti.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAXC * 3), 3);
    F.confetti.frustumCulled = false; F.confetti.castShadow = true;
    MV.setLayers(F.confetti, true);
    scene.add(F.confetti);

    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAXS * 3), 3));
    sg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAXS * 3), 3));
    sg.setAttribute('size', new THREE.BufferAttribute(new Float32Array(MAXS), 1));
    F.sparkMat = new THREE.ShaderMaterial({
      uniforms: { uPx: { value: 1 } },
      vertexShader: 'attribute float size; attribute vec3 color; varying vec3 vC; uniform float uPx; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize = size * uPx * 60.0 / -mv.z; gl_Position = projectionMatrix*mv; }',
      fragmentShader: 'varying vec3 vC; void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); float a=smoothstep(0.5,0.0,r); float star = max(smoothstep(0.06,0.0,abs(d.x))*smoothstep(0.5,0.0,abs(d.y)), smoothstep(0.06,0.0,abs(d.y))*smoothstep(0.5,0.0,abs(d.x))); gl_FragColor=vec4(vC*(a*a+star*0.8)*2.2, 1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    F.sparks = new THREE.Points(sg, F.sparkMat);
    F.sparks.frustumCulled = false;
    scene.add(F.sparks);

    // dust motes in the light
    const dn = 260, dg = new THREE.BufferGeometry(), dp = new Float32Array(dn * 3), dc = new Float32Array(dn * 3), ds = new Float32Array(dn);
    for (let i = 0; i < dn; i++) { dp[i * 3] = (U.hash(i) - 0.5) * 60; dp[i * 3 + 1] = U.hash(i + 0.5) * 30; dp[i * 3 + 2] = (U.hash(i + 0.25) - 0.5) * 40; dc[i * 3] = 1; dc[i * 3 + 1] = 0.92; dc[i * 3 + 2] = 0.8; ds[i] = 0.05 + U.hash(i + 0.75) * 0.1; }
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('color', new THREE.BufferAttribute(dc, 3)); dg.setAttribute('size', new THREE.BufferAttribute(ds, 1));
    F.dustBase = dp.slice();
    F.dust = new THREE.Points(dg, F.sparkMat.clone()); F.dust.material.uniforms.uPx = F.sparkMat.uniforms.uPx;
    F.dust.frustumCulled = false; scene.add(F.dust);

    buildIcons(scene); buildScreens(scene); buildFans(scene); buildProps(scene);
  };

  function particleState(e, i, t) {
    const tb = e.t0 + i / e.rate + (U.hash2(i, e.seed) - 0.5) * 0.6 / e.rate;
    const age = t - tb;
    if (age < 0 || age > e.life + (e.kind === 'confetti' ? 6 : 0) || tb > e.t1) return null;
    const h1 = U.hash2(i, e.seed + 1), h2 = U.hash2(i, e.seed + 2), h3 = U.hash2(i, e.seed + 3), h4 = U.hash2(i, e.seed + 4);
    const o = typeof e.origin === 'function' ? e.origin(tb, i) : e.origin;
    const d = e.dir;
    const vx = d[0] + (h1 - 0.5) * 2 * e.spread, vy = d[1] + (h2 - 0.5) * 2 * e.spread, vz = d[2] + (h3 - 0.5) * 2 * e.spread;
    const sp = e.speed * (0.6 + 0.8 * h4);
    // velocity decays with drag: x(t) = v (1 - e^{-k t}) / k
    const k = e.drag, f = k > 0 ? (1 - Math.exp(-k * age)) / k : age;
    const at = a => { const ff = k > 0 ? (1 - Math.exp(-k * a)) / k : a; return [o.x + vx * sp * ff + (e.kind === 'confetti' ? Math.sin(a * 3 + h1 * 9) * 0.8 : 0), o.y + vy * sp * ff + 0.5 * e.grav * a * a, o.z + vz * sp * ff]; };
    let p = at(age), landed = -1;
    if (e.kind === 'confetti' && p[1] < 0.12) {
      // find when it touched the paper and leave it lying there
      let lo = 0, hi = age;
      for (let it = 0; it < 14; it++) { const m = (lo + hi) / 2; if (at(m)[1] > 0.12) lo = m; else hi = m; }
      landed = hi; p = at(hi); p[1] = 0.1 + h3 * 0.02;
    }
    return { x: p[0], y: p[1], z: p[2], age, life: e.life + (e.kind === 'confetti' ? 6 : 0), landed, h1, h2, h3, h4 };
  }

  F.update = function (t, camera) {
    let nh = 0, nc = 0, ns = 0;
    const sp = F.sparks.geometry.attributes;
    for (const e of F.emitters) {
      if (t < e.t0 || t > e.t1 + e.life + (e.kind === 'confetti' ? 6 : 0)) continue;
      if (e.seed === undefined) e.seed = F.emitters.indexOf(e) * 7.13 + 1;
      const i0 = Math.max(0, Math.floor((t - e.life - (e.kind === 'confetti' ? 6 : 0) - e.t0) * e.rate) - 1), i1 = Math.ceil((Math.min(t, e.t1) - e.t0) * e.rate) + 1;
      for (let i = i0; i <= i1; i++) {
        const p = particleState(e, i, t);
        if (!p) continue;
        const fade = Math.min(U.c01(p.age * 6), U.c01((p.life - p.age) * 3));
        if (e.kind === 'heart' && nh < MAXH) {
          const s = e.size * (0.6 + 0.7 * p.h1) * U.back(U.c01(p.age * 3)) * (0.3 + 0.7 * fade);
          tmpE.set(Math.sin(p.age * e.spin + p.h2 * 6) * 0.6, p.age * e.spin * (p.h3 - 0.5) * 2, Math.sin(p.age * 1.7 + p.h1 * 5) * 0.4);
          tmpQ.setFromEuler(tmpE);
          tmpM.compose(tmpP.set(p.x, p.y, p.z), tmpQ, tmpS.set(s, s, s));
          F.hearts.setMatrixAt(nh, tmpM);
          tmpC.setHex(e.color || HEART_COLS[Math.floor(p.h4 * HEART_COLS.length)]);
          F.hearts.setColorAt(nh, tmpC);
          nh++;
        } else if (e.kind === 'confetti' && nc < MAXC) {
          if (p.landed >= 0) tmpE.set(-Math.PI / 2, 0, p.h2 * 6.28); else tmpE.set(p.age * 6 * p.h1 + p.h2 * 6, p.age * 4 * p.h3, p.age * 5 * p.h2);
          tmpQ.setFromEuler(tmpE);
          const s = e.size * (p.landed >= 0 ? Math.min(1, U.c01((p.life - p.age) * 1.5)) : fade);
          tmpM.compose(tmpP.set(p.x, p.y, p.z), tmpQ, tmpS.set(s, s, s));
          F.confetti.setMatrixAt(nc, tmpM);
          tmpC.setHex(CONF_COLS[Math.floor(p.h4 * CONF_COLS.length)]);
          F.confetti.setColorAt(nc, tmpC);
          nc++;
        } else if (e.kind === 'spark' && ns < MAXS) {
          sp.position.setXYZ(ns, p.x, p.y, p.z);
          tmpC.setHex(e.color || CONF_COLS[Math.floor(p.h4 * 5)]);
          const tw = 0.6 + 0.4 * Math.sin(p.age * 20 + p.h1 * 30);
          sp.color.setXYZ(ns, tmpC.r * fade * tw, tmpC.g * fade * tw, tmpC.b * fade * tw);
          sp.size.setX(ns, e.size * (0.5 + p.h2));
          ns++;
        }
      }
    }
    F.hearts.count = nh; F.hearts.instanceMatrix.needsUpdate = true; if (F.hearts.instanceColor) F.hearts.instanceColor.needsUpdate = true;
    F.confetti.count = nc; F.confetti.instanceMatrix.needsUpdate = true; if (F.confetti.instanceColor) F.confetti.instanceColor.needsUpdate = true;
    F.sparks.geometry.setDrawRange(0, ns);
    sp.position.needsUpdate = sp.color.needsUpdate = sp.size.needsUpdate = true;
    // dust drifts
    const dp = F.dust.geometry.attributes.position;
    for (let i = 0; i < dp.count; i++) {
      dp.setXYZ(i, F.dustBase[i * 3] + Math.sin(t * 0.13 + i) * 1.5, (F.dustBase[i * 3 + 1] + t * 0.25 * (0.3 + U.hash(i))) % 30, F.dustBase[i * 3 + 2] + Math.cos(t * 0.11 + i * 1.3) * 1.5);
    }
    dp.needsUpdate = true;
    updateCards(t, camera); updateIcons(t, camera); updateScreens(t); updateFans(t); updateProps(t, camera);
  };

  // ---------------------------------------------------------------- cards (billboarded text)
  F.cards = [];
  const FONT_HAND = "'Kalam', 'Comic Sans MS', cursive", FONT_UI = "'Poppins', 'Helvetica Neue', Arial, sans-serif";
  function drawCard(c) {
    const x = c.ctx, w = c.canvas.width, h = c.canvas.height;
    x.clearRect(0, 0, w, h);
    const text = typeof c.text === 'function' ? c.text(c._t) : c.text;
    if (c.style === 'note') {
      x.save(); x.translate(w / 2, h / 2); x.rotate(-0.04);
      x.fillStyle = '#fbf8f0'; x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 18; x.shadowOffsetY = 6;
      x.fillRect(-w * 0.44, -h * 0.36, w * 0.88, h * 0.72); x.shadowColor = 'transparent';
      x.fillStyle = '#25242a'; x.font = `700 ${h * 0.34}px ${FONT_HAND}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(text, 0, h * 0.02);
      if (c.sub) { x.font = `400 ${h * 0.12}px ${FONT_HAND}`; x.fillStyle = '#5b5960'; x.fillText(c.sub, 0, h * 0.25); }
      x.restore();
    } else if (c.style === 'bubble') {
      const bw = w * 0.9, bh = h * 0.62, bx = (w - bw) / 2, by = h * 0.08, r = bh * 0.45;
      x.fillStyle = c.bg || '#ffffff'; x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 16; x.shadowOffsetY = 5;
      x.beginPath(); x.moveTo(bx + r, by); x.arcTo(bx + bw, by, bx + bw, by + bh, r); x.arcTo(bx + bw, by + bh, bx, by + bh, r); x.lineTo(bx + bw * 0.3, by + bh); x.lineTo(bx + bw * 0.16, by + bh + h * 0.2); x.lineTo(bx + bw * 0.2, by + bh); x.arcTo(bx, by + bh, bx, by, r); x.arcTo(bx, by, bx + bw, by, r); x.closePath(); x.fill();
      x.shadowColor = 'transparent';
      x.fillStyle = c.fg || '#202024'; x.font = `600 ${h * 0.24}px ${FONT_UI}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(text, w / 2, by + bh / 2 + 2);
    } else if (c.style === 'pill') {
      const bw = w * 0.92, bh = h * 0.7, bx = (w - bw) / 2, by = (h - bh) / 2;
      const g = x.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, 'rgba(30,26,40,0.92)'); g.addColorStop(1, 'rgba(12,10,18,0.92)');
      x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(bx, by, bw, bh, bh / 2) : x.rect(bx, by, bw, bh); x.fill();
      x.strokeStyle = c.accent || '#ff4f9a'; x.lineWidth = h * 0.035; x.stroke();
      x.fillStyle = '#ffffff'; x.font = `700 ${h * 0.36}px ${FONT_UI}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(text, w / 2, h / 2 + 2);
    } else if (c.style === 'neon') {
      x.font = `800 ${h * 0.58}px ${FONT_UI}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.shadowColor = c.accent || '#ff3d8b'; x.shadowBlur = h * 0.18; x.fillStyle = '#ffffff';
      x.fillText(text, w / 2, h / 2); x.fillText(text, w / 2, h / 2);
    }
    c.tex.needsUpdate = true;
  }
  F.card = function (o) {
    const c = Object.assign({ style: 'note', w: 6, aspect: 2.2, res: 512, popIn: 0.35, popOut: 0.3, bob: 0.15, layerPop: false }, o);
    c.canvas = MV.canvas(c.res, Math.round(c.res / c.aspect)); c.ctx = c.canvas.getContext('2d');
    c.tex = MV.tex(c.canvas);
    c.mat = new THREE.MeshBasicMaterial({ map: c.tex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    c.mesh = new THREE.Mesh(new THREE.PlaneGeometry(c.w, c.w / c.aspect), c.mat);
    c.mesh.visible = false; c.mesh.renderOrder = 10;
    if (c.layerPop) MV.setLayers(c.mesh, true);
    F.scene.add(c.mesh);
    c._t = c.t0; c._last = null;
    F.cards.push(c);
    return c;
  };
  function updateCards(t, camera) {
    for (const c of F.cards) {
      const on = t >= c.t0 && t <= c.t1;
      c.mesh.visible = on;
      if (!on) continue;
      c._t = t;
      if (typeof c.text === 'function') { const s = c.text(t); if (s !== c._last) { c._last = s; drawCard(c); } }
      else if (c._last === null) { c._last = c.text; drawCard(c); }
      const kin = U.back(U.range(t, c.t0, c.t0 + c.popIn)), kout = 1 - U.in2(U.range(t, c.t1 - c.popOut, c.t1));
      const s = Math.max(0.001, kin * kout);
      const p = typeof c.pos === 'function' ? c.pos(t) : c.pos;
      c.mesh.position.set(p.x, p.y + Math.sin(t * 2.2 + c.t0) * c.bob, p.z);
      c.mesh.quaternion.copy(camera.quaternion);
      if (c.tilt) c.mesh.rotateZ(c.tilt);
      c.mesh.scale.setScalar(s);
    }
  }

  // ---------------------------------------------------------------- icons that leap out of the screen
  F.icons = [];
  function buildIcons(scene) {
    const glossy = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.18, clearcoat: 1, emissive: c, emissiveIntensity: 0.25 });
    F.iconGeo = { like: F.heartGeo(0.9, 0.35), share: ext(arrowShape(), 0.3), save: ext(bookmarkShape(), 0.3), plus: ext(plusShape(), 0.3) };
    F.iconMat = { like: glossy(0xff2d6f), share: glossy(0x2fd0ff), save: glossy(0xffd23a), plus: glossy(0xff4f9a) };
  }
  F.icon = function (o) {
    const m = new THREE.Mesh(F.iconGeo[o.kind], F.iconMat[o.kind]);
    m.visible = false; m.castShadow = true;
    MV.setLayers(m, true);
    F.scene.add(m);
    F.icons.push(Object.assign({ mesh: m, dur: 1.6, size: 1.6 }, o));
  };
  function updateIcons(t, camera) {
    const fwd = tmpP.set(0, 0, -1).applyQuaternion(camera.quaternion).clone();
    for (const ic of F.icons) {
      const k = (t - ic.t) / ic.dur;
      ic.mesh.visible = k >= 0 && k <= 1;
      if (!ic.mesh.visible) continue;
      const from = typeof ic.from === 'function' ? ic.from(ic.t) : ic.from;
      // travel from the girl to just in front of the lens, offset sideways so it sweeps past
      const camP = camera.position, side = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      const target = camP.clone().addScaledVector(fwd, 4.5).addScaledVector(side, ic.side * 2.6).addScaledVector(up, ic.up || 0.8);
      const e = U.inOut3(U.c01(k * 1.1));
      ic.mesh.position.lerpVectors(from, target, e).addScaledVector(up, Math.sin(Math.PI * e) * 2.5);
      ic.mesh.quaternion.copy(camera.quaternion);
      ic.mesh.rotateY(Math.sin(k * 6) * 0.5 + (1 - e) * 3);
      const s = ic.size * U.back(U.c01(k * 4)) * (1 - U.in2(U.range(k, 0.85, 1)));
      ic.mesh.scale.setScalar(Math.max(0.001, s));
    }
  }

  // ---------------------------------------------------------------- floating screens ("a million strangers")
  F.screens = [];
  function buildScreens(scene) {
    F.feedRT = new THREE.WebGLRenderTarget(288, 512, { type: THREE.UnsignedByteType, encoding: THREE.sRGBEncoding });
    F.feedRT.texture.encoding = THREE.sRGBEncoding;
    const frameMat = new THREE.MeshPhysicalMaterial({ color: 0x15151a, roughness: 0.25, metalness: 0.6, clearcoat: 1 });
    F.screenMat = new THREE.MeshBasicMaterial({ map: F.feedRT.texture, toneMapped: false });
    const N = 11;
    for (let i = 0; i < N; i++) {
      const g = new THREE.Group();
      const w = 5.4, h = 9.6;
      const body = new THREE.Mesh(new THREE.ExtrudeGeometry(MV.roundedRect(w, h, 0.8), { depth: 0.35, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.12, bevelSegments: 2 }), frameMat);
      body.position.z = -0.45;
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.92), F.screenMat.clone());
      sc.material.color.setScalar(1.15);
      sc.layers.set(MV.L_SCREEN);
      g.add(body, sc);
      const a = U.lerp(-1.25, 1.25, i / (N - 1));
      const r = 30 + (i % 2) * 6;
      g.userData = { a, r, y: 11 + (i % 3) * 7 + U.hash(i) * 3, sc, ph: U.hash(i + 3) * 6 };
      g.visible = false;
      scene.add(g); F.screens.push(g);
    }
  }
  F.screenState = t => ({ on: 0, turn: 0, dead: 0 });
  function updateScreens(t) {
    const st = F.screenState(t);
    F.screens.forEach((g, i) => {
      const d = g.userData;
      const appear = U.c01(st.on * (F.screens.length + 3) - (Math.abs(i - (F.screens.length - 1) / 2)) * 1.0);
      g.visible = appear > 0.01;
      if (!g.visible) return;
      const x = Math.sin(d.a) * d.r, z = -Math.cos(d.a) * d.r * 0.75 - 4;
      g.position.set(x, d.y + Math.sin(t * 0.8 + d.ph) * 0.6 - (1 - U.out3(appear)) * 25, z);
      g.lookAt(0, 6, 4);
      g.rotateY(st.turn * Math.PI * U.c01(st.turn * 1.4 - i * 0.04));
      const dead = U.c01(st.dead * (F.screens.length + 2) - i);
      const flick = dead > 0 && dead < 1 ? (Math.sin(t * 60 + i) > 0 ? 1 : 0.2) : 1;
      d.sc.material.color.setScalar(1.15 * (1 - dead) * flick + 0.02);
      g.scale.setScalar(Math.max(0.001, U.back(appear)));
    });
  }

  // ---------------------------------------------------------------- paper fans
  F.fans = [];
  function fanCanvas(seed) {
    const c = MV.canvas(256, 384), x = c.getContext('2d');
    const hue = ['#ff6f91', '#5ec8ff', '#ffd23a', '#9a6bff', '#4dd9a0'][seed % 5];
    x.lineJoin = 'round'; x.lineCap = 'round';
    const path = () => {
      x.beginPath(); x.arc(128, 92, 46, 0, TAU);
      x.moveTo(80, 160); x.quadraticCurveTo(128, 130, 176, 160); x.lineTo(186, 290); x.lineTo(70, 290); x.closePath();
      x.moveTo(88, 290); x.lineTo(92, 370); x.moveTo(168, 290); x.lineTo(164, 370);
      x.moveTo(178, 170); x.lineTo(214, 96); x.moveTo(78, 170); x.lineTo(46, 110 + (seed % 3) * 30);
    };
    x.strokeStyle = '#f6f3ea'; x.lineWidth = 34; path(); x.stroke(); x.fillStyle = '#f6f3ea'; x.fill();
    x.fillStyle = hue; x.beginPath(); x.moveTo(80, 160); x.quadraticCurveTo(128, 130, 176, 160); x.lineTo(186, 290); x.lineTo(70, 290); x.closePath(); x.fill();
    x.strokeStyle = '#26252b'; x.lineWidth = 5; path(); x.stroke();
    x.fillStyle = '#26252b'; x.beginPath(); x.arc(112, 88, 5, 0, TAU); x.arc(144, 88, 5, 0, TAU); x.fill();
    x.beginPath(); x.arc(128, 104, 14, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
    x.save(); x.translate(218, 84); x.rotate(0.35); x.fillStyle = '#1b1b20'; x.fillRect(-16, -28, 32, 56); x.fillStyle = '#bfe0ff'; x.fillRect(-12, -23, 24, 46); x.restore();
    return c;
  }
  function buildFans(scene) {
    const N = 12;
    for (let i = 0; i < N; i++) {
      const tex = MV.tex(fanCanvas(i));
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.8), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }));
      m.position.y = 2.4; m.castShadow = true;
      m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
      const g = new THREE.Group(); g.add(m);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.75), new THREE.MeshBasicMaterial({ color: 0xbfe0ff, toneMapped: false }));
      glow.position.set(1.15, 3.9, 0.02); glow.rotation.z = -0.35; g.add(glow); glow.material.color.setScalar(2.2);
      const a = U.lerp(-2.4, 2.4, i / (N - 1)) + Math.PI;
      const rx = 17.5, rz = 12.2;
      g.position.set(Math.sin(a) * rx, MV.world.PAPER_Y, Math.cos(a) * rz);
      g.lookAt(0, MV.world.PAPER_Y, 2);
      g.userData = { i, base: g.quaternion.clone() };
      g.visible = false;
      scene.add(g); F.fans.push(g);
    }
  }
  F.fanState = t => 0;
  function updateFans(t) {
    const st = F.fanState(t);
    const bp = MV.beatPos(t);
    F.fans.forEach((g, i) => {
      const k = U.c01(st * (F.fans.length + 4) - i * 0.8);
      g.visible = k > 0.001;
      if (!g.visible) return;
      g.quaternion.copy(g.userData.base);
      g.rotateX(-(1 - U.back(k)) * Math.PI / 2);
      g.position.y = MV.world.PAPER_Y + Math.max(0, Math.sin(Math.PI * (bp + i * 0.5))) * 0.45 * k;
    });
  }

  // ---------------------------------------------------------------- props
  function buildProps(scene) {
    // clapperboard
    const cb = new THREE.Group();
    F.clapCanvas = MV.canvas(512, 384); F.clapTex = MV.tex(F.clapCanvas);
    const face = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 0.2), [0, 0, 0, 0, new THREE.MeshStandardMaterial({ map: F.clapTex, roughness: 0.6 }), 0].map(m => m || new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.5 })));
    cb.add(face);
    const stripeC = MV.canvas(256, 32), sx = stripeC.getContext('2d');
    for (let i = 0; i < 8; i++) { sx.fillStyle = i % 2 ? '#141418' : '#f4f4f4'; sx.beginPath(); sx.moveTo(i * 32, 32); sx.lineTo(i * 32 + 16, 0); sx.lineTo(i * 32 + 48, 0); sx.lineTo(i * 32 + 32, 32); sx.fill(); }
    const stripeMat = new THREE.MeshStandardMaterial({ map: MV.tex(stripeC), roughness: 0.5 });
    const hinge = new THREE.Group(); hinge.position.set(-2.1, 1.75, 0); cb.add(hinge);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 0.22), stripeMat); arm.position.x = 2.1; hinge.add(arm);
    const fixed = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 0.22), stripeMat); fixed.position.y = 1.4; cb.add(fixed);
    MV.shadows(cb, true, false);
    cb.visible = false; scene.add(cb);
    F.clap = { group: cb, hinge, text: '' };
    // ball
    const bc = MV.canvas(256, 128), bx = bc.getContext('2d');
    bx.fillStyle = '#ff3d5a'; bx.fillRect(0, 0, 256, 128); bx.fillStyle = '#fff6e8'; bx.fillRect(0, 54, 256, 20);
    F.ball = new THREE.Mesh(new THREE.SphereGeometry(0.7, 28, 18), new THREE.MeshPhysicalMaterial({ map: MV.tex(bc), roughness: 0.35, clearcoat: 0.7 }));
    F.ball.castShadow = true; F.ball.visible = false; MV.outlined(F.ball); scene.add(F.ball);
    // empty chair
    const chair = new THREE.Group(), wood = new THREE.MeshStandardMaterial({ color: 0xd8c8b0, roughness: 0.8 });
    const box = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood); m.position.set(x, y, z); MV.outlined(m); chair.add(m); };
    box(3.2, 0.3, 3.0, 0, 2.6, 0);
    for (const [x, z] of [[-1.4, -1.3], [1.4, -1.3], [-1.4, 1.3], [1.4, 1.3]]) box(0.26, 2.6, 0.26, x, 1.3, z);
    box(0.26, 3.4, 0.26, -1.4, 4.4, -1.3); box(0.26, 3.4, 0.26, 1.4, 4.4, -1.3); box(3.0, 0.9, 0.2, 0, 5.4, -1.3); box(3.0, 0.3, 0.2, 0, 4.2, -1.3);
    MV.shadows(chair, true, false); chair.visible = false; scene.add(chair); F.chair = chair;
    // clock card is a regular card; ghost is built in story once the girl exists
  }
  F.drawClap = function (text) {
    if (F.clap.text === text) return;
    F.clap.text = text;
    const x = F.clapCanvas.getContext('2d'), w = 512, h = 384;
    x.fillStyle = '#16161b'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#e8e8e8'; x.lineWidth = 4; x.strokeRect(20, 20, w - 40, h - 40);
    x.beginPath(); x.moveTo(20, 150); x.lineTo(w - 20, 150); x.moveTo(w / 2, 150); x.lineTo(w / 2, h - 20); x.stroke();
    x.fillStyle = '#f2f2f2'; x.font = `700 46px ${FONT_UI}`; x.textBaseline = 'middle'; x.textAlign = 'center';
    x.fillText('TIKTOK FAMOUS', w / 2, 86);
    x.font = `700 30px ${FONT_UI}`; x.fillText('SCENE', w / 4, 190); x.fillText('TAKE', (w * 3) / 4, 190);
    x.font = `700 96px ${FONT_HAND}`; x.fillText('1', w / 4, 290); x.fillStyle = '#ff4f9a'; x.fillText(text, (w * 3) / 4, 290);
    F.clapTex.needsUpdate = true;
  };
  F.clapState = t => null;
  F.ballState = t => null;
  F.chairState = t => 0;
  function updateProps(t, camera) {
    const cs = F.clapState(t);
    F.clap.group.visible = !!cs;
    if (cs) {
      F.drawClap(cs.text);
      const k = U.range(t, cs.t0, cs.t0 + 0.4), out = 1 - U.range(t, cs.t1 - 0.3, cs.t1);
      F.clap.group.position.copy(cs.pos);
      F.clap.group.quaternion.copy(camera.quaternion);
      F.clap.group.rotateZ(-0.12);
      F.clap.group.scale.setScalar(Math.max(0.001, U.back(k) * out * (cs.scale || 1)));
      const ck = U.range(t, cs.clap - 0.35, cs.clap);
      F.clap.hinge.rotation.z = t < cs.clap ? 0.55 * U.sstep(0, 0.6, ck) : 0.55 * (1 - U.c01((t - cs.clap) * 14)) * 0 ;
      if (t < cs.clap - 0.35) F.clap.hinge.rotation.z = 0.55 * U.c01((t - cs.t0) * 3);
    }
    const b = F.ballState(t);
    F.ball.visible = !!b;
    if (b) {
      // roll without slipping: turn by distance / radius about the axis across the motion
      if (F.ballPrev && t - F.ballT > 0 && t - F.ballT < 0.25) {
        const dx = b.pos.x - F.ballPrev.x, dz = b.pos.z - F.ballPrev.z, dist = Math.hypot(dx, dz);
        if (dist > 1e-4) { tmpQ.setFromAxisAngle(tmpP.set(dz / dist, 0, -dx / dist), dist / 0.7); F.ball.quaternion.premultiply(tmpQ); }
      }
      F.ballPrev = (F.ballPrev || new THREE.Vector3()).copy(b.pos); F.ballT = t;
      F.ball.position.copy(b.pos);
    }
    const ch = F.chairState(t);
    F.chair.visible = ch > 0.01;
    if (ch > 0.01) { F.chair.scale.setScalar(Math.max(0.001, U.back(ch))); }
  }
})();
