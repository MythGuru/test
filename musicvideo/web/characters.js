/* TikTok Famous: the girl and her dog (rigs, faces, drawings, dance moves) */
(function () {
  const MV = window.MV, U = MV.U, TAU = U.TAU;
  const C = (MV.chars = {});

  // ---------------------------------------------------------------- dimensions (cm)
  const G = (C.G = {
    shoe: 0.5, shin: 1.6, thigh: 1.7, hipW: 0.52,
    torso: 2.45, shoulderW: 1.12, neck: 0.18, headR: 1.55,
    upper: 1.42, fore: 1.28, hand: 0.33,
  });
  G.hipH = G.shoe + G.shin + G.thigh;
  G.headC = G.hipH + G.torso + G.neck + G.headR * 0.95;

  const mat = {};
  function makeMaterials() {
    const stripes = MV.canvas(64, 256), x = stripes.getContext('2d');
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#fbf3e8' : '#ff6f91'; x.fillRect(0, i * 32, 64, 32); }
    const st = MV.tex(stripes); st.wrapS = st.wrapT = THREE.RepeatWrapping;
    const bumpCanvas = (w, h, draw) => { const c = MV.canvas(w, h), x = c.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); draw(x, w, h); const t = MV.tex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const knit = bumpCanvas(256, 512, (x, w, h) => { x.strokeStyle = '#d8d8d8'; x.lineWidth = 3; const cw = w / 16, ch = h / 44; for (let j = 0; j < 44; j++) for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(i * cw, j * ch); x.lineTo(i * cw + cw / 2, j * ch + ch); x.lineTo(i * cw + cw, j * ch); x.stroke(); } });
    const strands = bumpCanvas(512, 256, (x, w, h) => { for (let i = 0; i < 900; i++) { const g = 60 + Math.random() * 160; x.strokeStyle = `rgb(${g},${g},${g})`; x.lineWidth = 1 + Math.random() * 1.5; const px = Math.random() * w; x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + 6, h * 0.3, px - 6, h * 0.6, px + 3, h); x.stroke(); } });
    const fur = bumpCanvas(256, 256, (x, w, h) => { for (let i = 0; i < 5000; i++) { const g = Math.random() * 255; x.fillStyle = `rgba(${g},${g},${g},0.5)`; x.fillRect(Math.random() * w, Math.random() * h, 1, 3); } });
    fur.repeat.set(4, 4);
    mat.skin = new THREE.MeshPhysicalMaterial({ color: 0xf3c9ad, roughness: 0.55, clearcoat: 0.08 });
    mat.hair = new THREE.MeshPhysicalMaterial({ color: 0x3b2622, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.25, bumpMap: strands, bumpScale: 0.035 });
    mat.sweater = new THREE.MeshStandardMaterial({ map: st, roughness: 0.95, bumpMap: knit, bumpScale: 0.045 });
    mat.sleeve = new THREE.MeshStandardMaterial({ color: 0xfbf3e8, roughness: 0.95, bumpMap: knit, bumpScale: 0.04 });
    mat.skirt = new THREE.MeshStandardMaterial({ color: 0x3f6fd8, roughness: 0.85, bumpMap: knit, bumpScale: 0.02 });
    mat.sock = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    mat.shoe = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.4, clearcoat: 0.6 });
    mat.sole = new THREE.MeshStandardMaterial({ color: 0xff4f9a, roughness: 0.6 });
    mat.bow = new THREE.MeshPhysicalMaterial({ color: 0xff3d8b, roughness: 0.35, clearcoat: 0.7 });
    mat.eye = new THREE.MeshPhysicalMaterial({ color: 0x15121a, roughness: 0.15, clearcoat: 1 });
    mat.shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
    mat.mouth = new THREE.MeshStandardMaterial({ color: 0x5a1a24, roughness: 0.6 });
    mat.lip = new THREE.MeshStandardMaterial({ color: 0x8c2f3c, roughness: 0.5 });
    mat.blush = new THREE.MeshBasicMaterial({ color: 0xff7c9a, transparent: true, opacity: 0.45, depthWrite: false });
    mat.tear = new THREE.MeshPhysicalMaterial({ color: 0x9fd8ff, roughness: 0.05, transparent: true, opacity: 0.85, clearcoat: 1 });
    mat.fur = new THREE.MeshPhysicalMaterial({ color: 0xf2ebdf, roughness: 0.88, bumpMap: fur, bumpScale: 0.05 });
    mat.spot = new THREE.MeshStandardMaterial({ color: 0x80563a, roughness: 0.88, bumpMap: fur, bumpScale: 0.05 });
    mat.collar = new THREE.MeshPhysicalMaterial({ color: 0xff3d5a, roughness: 0.35, clearcoat: 0.6 });
    mat.gold = new THREE.MeshStandardMaterial({ color: 0xffc94a, roughness: 0.25, metalness: 1 });
    mat.nose = new THREE.MeshPhysicalMaterial({ color: 0x1a1414, roughness: 0.2, clearcoat: 1 });
    mat.tongue = new THREE.MeshStandardMaterial({ color: 0xff7f95, roughness: 0.5 });
    mat.glasses = new THREE.MeshPhysicalMaterial({ color: 0xff2f7d, roughness: 0.2, clearcoat: 1, metalness: 0.2 });
    mat.lens = new THREE.MeshPhysicalMaterial({ color: 0x1b0d22, roughness: 0.05, metalness: 0.4, clearcoat: 1 });
  }
  C.mat = mat;

  const mesh = (geo, m, x = 0, y = 0, z = 0, outline = true) => {
    const o = new THREE.Mesh(geo, m); o.position.set(x, y, z);
    if (outline) MV.outlined(o);
    return o;
  };
  const sph = (r, ws = 24, hs = 16) => new THREE.SphereGeometry(r, ws, hs);
  const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  function limbGeo(r0, r1, len) { const g = new THREE.CylinderGeometry(r1, r0, len, 16, 1); g.translate(0, -len / 2, 0); return g; }

  // ---------------------------------------------------------------- hands with fingers
  // The palm faces the body's midline (-s along x); fingers spread along z and curl toward the palm.
  const FING = [[0.15, 0.17, 0.14, 0.052], [0.05, 0.2, 0.16, 0.055], [-0.05, 0.19, 0.15, 0.053], [-0.15, 0.15, 0.12, 0.046]];
  function buildHand(wr, s) {
    const H = { s, fingers: [], thumb: [] };
    wr.add(mesh(sph(1, 16, 12).scale(0.135, 0.25, 0.25), mat.skin, 0, -0.22, 0, false));
    for (const [z, l1, l2, r] of FING) {
      const p = group(wr, -s * 0.01, -0.43, z);
      p.add(mesh(sph(r * 1.05, 10, 8), mat.skin, 0, 0, 0, false));
      p.add(mesh(limbGeo(r, r * 0.95, l1), mat.skin, 0, 0, 0, false));
      const d = group(p, 0, -l1, 0);
      d.add(mesh(sph(r * 0.98, 10, 8), mat.skin, 0, 0, 0, false));
      d.add(mesh(limbGeo(r * 0.95, r * 0.82, l2), mat.skin, 0, 0, 0, false));
      d.add(mesh(sph(r * 0.84, 10, 8), mat.skin, 0, -l2, 0, false));
      H.fingers.push({ p, d });
    }
    const t0 = group(wr, -s * 0.06, -0.14, 0.2);
    t0.rotation.set(-0.75, 0, -s * 0.35);
    t0.add(mesh(sph(0.07, 10, 8), mat.skin, 0, 0, 0, false));
    t0.add(mesh(limbGeo(0.066, 0.06, 0.15), mat.skin, 0, 0, 0, false));
    const t1 = group(t0, 0, -0.15, 0);
    t1.add(mesh(limbGeo(0.06, 0.052, 0.13), mat.skin, 0, 0, 0, false));
    t1.add(mesh(sph(0.053, 10, 8), mat.skin, 0, -0.13, 0, false));
    H.thumb = [t0, t1];
    return H;
  }
  // curl 0 open .. 1 fist; idx/mid lift the index and middle fingers straight
  C.poseHand = function (H, curl, idx, mid) {
    const s = H.s;
    H.fingers.forEach((f, i) => {
      let c = curl;
      if (i === 0) c = U.lerp(curl, 0, idx);
      if (i === 1) c = U.lerp(curl, 0, mid);
      const spread = (i - 1.5) * 0.08 * (1 - c);
      f.p.rotation.set(spread, 0, -s * c * 1.35);
      f.d.rotation.set(0, 0, -s * c * 1.55);
    });
    H.thumb[0].rotation.set(-0.75 + curl * 0.35, 0, -s * (0.35 + curl * 0.55));
    H.thumb[1].rotation.set(0, 0, -s * curl * 0.9);
  };

  // ---------------------------------------------------------------- the girl
  C.makeGirl = function () {
    if (!mat.skin) makeMaterials();
    const root = new THREE.Group();
    const J = {};
    J.hips = group(root, 0, G.hipH, 0);
    // skirt with pleats
    const prof = [];
    for (let i = 0; i <= 10; i++) { const k = i / 10; prof.push(new THREE.Vector2(0.98 + 0.82 * Math.pow(k, 1.2), 0.32 - 1.62 * k)); }
    const skirtGeo = new THREE.LatheGeometry(prof.reverse(), 56);
    const sp = skirtGeo.attributes.position;
    for (let i = 0; i < sp.count; i++) {
      const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i), a = Math.atan2(z, x), depth = U.c01((0.32 - y) / 1.62);
      const r = Math.hypot(x, z) + 0.07 * Math.sin(a * 16) * depth;
      sp.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r * 0.82);
    }
    skirtGeo.computeVertexNormals();
    J.skirt = mesh(skirtGeo, mat.skirt); J.hips.add(J.skirt);
    // spine + sweater
    J.spine = group(J.hips, 0, 0.12, 0);
    const tp = [[0.0, 0.0], [0.92, 0.0], [0.97, 0.5], [1.06, 1.2], [1.12, 1.8], [1.14, 2.15], [1.02, 2.38], [0.62, 2.5], [0.36, 2.56], [0.0, 2.58]].map(p => new THREE.Vector2(p[0], p[1]));
    const torsoGeo = new THREE.LatheGeometry(tp, 40);
    torsoGeo.scale(1, 1, 0.74);
    J.torso = mesh(torsoGeo, mat.sweater); J.spine.add(J.torso);
    mat.sweater.map.repeat.set(1, 1.6);
    // neck + head
    J.neck = group(J.spine, 0, G.torso, 0);
    J.neck.add(mesh(limbGeo(0.3, 0.3, G.neck + 0.3).translate(0, G.neck + 0.15, 0), mat.skin));
    J.collarKnit = mesh(new THREE.TorusGeometry(0.42, 0.13, 10, 24), mat.sleeve, 0, 0.02, 0); J.collarKnit.rotation.x = Math.PI / 2; J.neck.add(J.collarKnit);
    J.head = group(J.neck, 0, G.neck, 0);
    const headGeo = sph(G.headR, 40, 28); headGeo.scale(1, 0.97, 0.95);
    J.skull = mesh(headGeo, mat.skin, 0, G.headR * 0.95, 0); J.head.add(J.skull);
    const hc = G.headR * 0.95; J.hc = hc;
    // face
    J.eyes = [];
    for (const s of [-1, 1]) {
      const eg = group(J.head, s * 0.56, hc + 0.05, 1.33);
      const e = new THREE.Mesh(sph(0.27, 20, 14).scale(0.78, 1.15, 0.42), mat.eye); eg.add(e);
      const sh1 = new THREE.Mesh(sph(0.075, 10, 8), mat.shine); sh1.position.set(0.07, 0.11, 0.1); eg.add(sh1);
      const sh2 = new THREE.Mesh(sph(0.04, 8, 6), mat.shine); sh2.position.set(-0.06, -0.08, 0.1); eg.add(sh2);
      const lash = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.05), mat.eye);
      lash.position.set(s * 0.22, 0.24, 0.02); lash.rotation.z = s * 0.6; eg.add(lash);
      eg.rotation.y = s * 0.38;
      J.eyes.push(eg);
      const bl = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), mat.blush);
      bl.position.set(s * 0.98, hc - 0.48, 1.18); bl.rotation.y = s * 0.68; J.head.add(bl);
    }
    J.head.add(mesh(sph(0.11, 12, 8), mat.skin, 0, hc - 0.32, 1.5, false));
    J.mouth = group(J.head, 0, hc - 0.78, 1.33);
    J.mouth.rotation.x = 0.42;
    J.smile = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 8, 20, Math.PI), mat.lip);
    J.smile.rotation.z = Math.PI; J.mouth.add(J.smile);
    J.open = new THREE.Mesh(sph(0.27, 20, 12).scale(1, 1, 0.32), mat.mouth); J.mouth.add(J.open);
    J.tears = [];
    for (const s of [-1, 1]) {
      const tr = new THREE.Mesh(sph(0.12, 12, 8).scale(0.8, 1.25, 0.8), mat.tear);
      tr.position.set(s * 0.62, hc - 0.25, 1.32); tr.visible = false; J.head.add(tr); J.tears.push(tr);
    }
    // hair
    const cap = new THREE.SphereGeometry(G.headR * 1.05, 40, 24, 0, TAU, 0, Math.PI * 0.56);
    cap.scale(1, 0.98, 0.98);
    const capM = mesh(cap, mat.hair, 0, hc, 0); capM.rotation.x = -0.42; J.head.add(capM);
    const back = mesh(sph(1, 28, 18).scale(1.5, 1.42, 0.95), mat.hair, 0, hc - 0.55, -0.72); J.head.add(back);
    for (let i = 0; i < 6; i++) {
      const a = U.lerp(-0.95, 0.95, i / 5);
      const b = mesh(sph(1, 14, 10).scale(0.3, 0.42, 0.2), mat.hair, Math.sin(a) * 1.4, hc + 1.05 - Math.abs(a) * 0.32, Math.cos(a) * 1.28);
      b.rotation.set(-0.5, a, -a * 0.35);
      J.head.add(b);
    }
    for (const s of [-1, 1]) {
      const lock = mesh(sph(1, 14, 10).scale(0.32, 1.05, 0.34), mat.hair, s * 1.42, hc - 0.55, 0.55);
      lock.rotation.z = s * 0.12; J.head.add(lock);
    }
    // ponytail: a chain that swings
    J.pony = [];
    let parent = group(J.head, 0, hc + 1.35, -1.0);
    parent.rotation.x = 0.9;
    J.ponyBase = parent;
    for (let i = 0; i < 5; i++) {
      const r = 0.55 - i * 0.07;
      const seg = group(parent, 0, i === 0 ? 0 : -0.62, 0);
      seg.add(mesh(sph(1, 16, 12).scale(r, 0.62, r * 0.9), mat.hair, 0, -0.32, 0));
      J.pony.push(seg); parent = seg;
    }
    // bow
    const bow = group(J.ponyBase, 0, 0.15, -0.1); bow.rotation.x = -0.9;
    for (const s of [-1, 1]) {
      const c = mesh(new THREE.ConeGeometry(0.42, 0.85, 16), mat.bow, s * 0.45, 0, 0);
      c.rotation.z = s * Math.PI / 2; c.scale.set(1, 1, 0.45); bow.add(c);
    }
    bow.add(mesh(sph(0.2, 12, 8), mat.bow));
    // heart sunglasses (hidden until "gotta be extra")
    J.glasses = group(J.head, 0, hc + 0.1, 1.5); J.glasses.visible = false;
    const hs = new THREE.Shape(); hs.moveTo(0, -0.32); hs.bezierCurveTo(-0.5, 0.02, -0.38, 0.42, 0, 0.2); hs.bezierCurveTo(0.38, 0.42, 0.5, 0.02, 0, -0.32);
    for (const s of [-1, 1]) {
      const lens = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.06, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 2 }), mat.lens);
      lens.position.set(s * 0.58, 0, 0); lens.rotation.y = s * 0.3; J.glasses.add(lens);
      const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.03, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.03, bevelSegments: 2 }), mat.glasses);
      rim.position.set(s * 0.58, 0, -0.03); rim.rotation.y = s * 0.3; J.glasses.add(rim);
    }
    J.glasses.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.06), mat.glasses));
    // arms
    for (const s of [-1, 1]) {
      const k = s > 0 ? 'l' : 'r';
      const sh = group(J.spine, s * G.shoulderW, G.torso - 0.3, 0);
      sh.add(mesh(sph(0.42, 16, 12).scale(1, 0.95, 0.9), mat.sweater, 0, -0.05, 0));
      sh.add(mesh(limbGeo(0.32, 0.29, G.upper + 0.1), mat.sweater));
      const el = group(sh, 0, -G.upper, 0);
      el.add(mesh(sph(0.29, 12, 10), mat.sweater));
      el.add(mesh(limbGeo(0.28, 0.3, G.fore * 0.72), mat.sweater));
      el.add(mesh(limbGeo(0.19, 0.18, G.fore), mat.skin, 0, 0, 0, false));
      const cuff = mesh(new THREE.TorusGeometry(0.29, 0.07, 8, 20), mat.sleeve, 0, -G.fore * 0.72, 0, false); cuff.rotation.x = Math.PI / 2; el.add(cuff);
      const wr = group(el, 0, -G.fore, 0);
      J[k + 'Hand'] = buildHand(wr, s);
      J[k + 'Sh'] = sh; J[k + 'El'] = el; J[k + 'Wr'] = wr;
    }
    // a little phone that lives in her right hand
    J.handPhone = MV.makePhone(0.9, 1.85, 0.12);
    // back of the phone against the palm, screen facing the same way as the palm
    J.handPhone.position.set(0.2, -0.4, -0.12); J.handPhone.rotation.set(0, Math.PI / 2, 0);
    J.handPhone.visible = false; J.rWr.add(J.handPhone);
    J.handPhone.userData.screen.layers.set(0);
    J.handPhone.userData.screen.material = new THREE.MeshBasicMaterial({ color: 0x9fc4ff });
    // legs
    for (const s of [-1, 1]) {
      const k = s > 0 ? 'l' : 'r';
      const hp = group(J.hips, s * G.hipW, 0, 0);
      hp.add(mesh(limbGeo(0.36, 0.31, G.thigh), mat.skin));
      const kn = group(hp, 0, -G.thigh, 0);
      kn.add(mesh(limbGeo(0.3, 0.26, G.shin), mat.skin));
      kn.add(mesh(limbGeo(0.29, 0.29, 0.75).translate(0, -G.shin + 0.75, 0), mat.sock));
      const an = group(kn, 0, -G.shin, 0);
      an.add(mesh(sph(1, 20, 14).scale(0.48, 0.34, 0.86), mat.shoe, 0, -0.18, 0.26));
      an.add(mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.12, 20).scale(1, 1, 1.75), mat.sole, 0, -0.44, 0.26, false));
      J[k + 'Hp'] = hp; J[k + 'Kn'] = kn; J[k + 'An'] = an;
    }
    MV.shadows(root, true, false);
    return { root, J, kind: 'girl' };
  };

  // Default standing pose; moves override fields.
  C.REST = {
    sx: 0, sy: 0, sz: 0, hx: 0, hy: 0, hz: 0,
    lsx: 0, lsy: 0, lsz: 0.16, le: 0.12, lwx: 0, rsx: 0, rsy: 0, rsz: 0.16, re: 0.12, rwx: 0,
    lhx: 0, lhz: 0.02, lk: 0, la: 0, rhx: 0, rhz: 0.02, rk: 0, ra: 0,
    lift: 0, yaw: 0, ox: 0, oz: 0, pitch: 0, roll: 0, hipsY: -1,
    eyes: 1, smile: 0.55, open: 0, phone: 0, glasses: 0, tears: 0, ponyKick: 0, lookX: 0,
    lCurl: 0.35, rCurl: 0.35, lIdx: 0, rIdx: 0, lMid: 0, rMid: 0,
    ikPhone: 0, ikSelfie: 0, ikEar: 0, ikFace: 0, ikLap: 0, ikHeart: 0, ikHug: 0, aim: 0,
  };
  const KEYS = Object.keys(C.REST);
  C.blendPose = (a, b, k) => { const o = {}; for (const key of KEYS) o[key] = U.lerp(a[key], b[key], k); return o; };
  C.full = p => Object.assign({}, C.REST, p);

  const legExt = (hx, k, hz) => (G.thigh * Math.cos(hx) + G.shin * Math.cos(hx - k)) * Math.cos(hz) + G.shoe;

  C.applyGirl = function (g, P, t) {
    const J = g.J;
    J.spine.rotation.set(P.sx, P.sy, P.sz);
    J.neck.rotation.set(P.hx * 0.35, P.hy * 0.3, P.hz * 0.3);
    J.head.rotation.set(P.hx * 0.65, P.hy * 0.7, P.hz * 0.7);
    J.lSh.rotation.set(-P.lsx, P.lsy, P.lsz); J.lEl.rotation.set(-P.le, 0, 0); J.lWr.rotation.set(P.lwx, 0, 0);
    J.rSh.rotation.set(-P.rsx, P.rsy, -P.rsz); J.rEl.rotation.set(-P.re, 0, 0); J.rWr.rotation.set(P.rwx, 0, 0);
    J.lHp.rotation.set(-P.lhx, 0, P.lhz); J.lKn.rotation.set(P.lk, 0, 0); J.lAn.rotation.set(P.la - (P.lhx - P.lk) * 0.0, 0, 0);
    J.rHp.rotation.set(-P.rhx, 0, -P.rhz); J.rKn.rotation.set(P.rk, 0, 0); J.rAn.rotation.set(P.ra, 0, 0);
    const hy = P.hipsY >= 0 ? P.hipsY : Math.max(legExt(P.lhx, P.lk, P.lhz), legExt(P.rhx, P.rk, P.rhz));
    J.hips.position.set(P.ox, hy + P.lift, P.oz);
    J.hips.rotation.set(0, 0, 0);
    // face
    const blink = blinkAt(t);
    for (const e of J.eyes) e.scale.y = Math.max(0.08, P.eyes * (1 - blink));
    const open = U.c01(P.open);
    J.open.scale.set(0.75 + open * 0.35, 0.05 + open * 0.95, 1);
    J.open.visible = open > 0.04;
    J.smile.visible = open < 0.55;
    J.smile.rotation.z = P.smile >= 0 ? Math.PI : 0;
    J.smile.scale.set(0.6 + Math.abs(P.smile) * 0.6, 0.4 + Math.abs(P.smile) * 0.8, 1);
    J.smile.position.y = P.smile >= 0 ? 0.08 : -0.12;
    J.handPhone.visible = P.phone > 0.5;
    C.poseHand(J.lHand, U.c01(P.lCurl), U.c01(P.lIdx), U.c01(P.lMid));
    C.poseHand(J.rHand, U.c01(Math.max(P.rCurl, P.phone > 0.5 ? 0.55 : 0)), U.c01(P.rIdx), U.c01(P.rMid));
    J.glasses.visible = P.glasses > 0.5;
    J.tears.forEach((tr, i) => {
      tr.visible = P.tears > 0.05;
      const k = ((t * 0.9 + i * 0.47) % 1);
      tr.position.y = J.hc - 0.25 - k * 1.1; tr.scale.setScalar(0.6 + 0.6 * Math.sin(Math.PI * k));
    });
    // ponytail swing: driven by the beat, head motion and kicks
    const bp = MV.beatPos(t);
    const sw = 0.18 + P.ponyKick * 0.5;
    J.pony.forEach((seg, i) => {
      seg.rotation.x = (i === 0 ? 0 : 0.16) + Math.sin(bp * Math.PI - i * 0.7) * sw * 0.6 - P.hx * 0.3 * (i === 1 ? 1 : 0);
      seg.rotation.z = Math.sin(bp * Math.PI * 0.5 - i * 0.55) * sw + P.hz * 0.4 * (i === 1 ? 1 : 0);
    });
  };
  function blinkAt(t) {
    const period = 3.1, k = (t + 0.7 * U.hash(Math.floor(t / period))) % period;
    return k < 0.14 ? Math.sin((k / 0.14) * Math.PI) : 0;
  }

  // ---------------------------------------------------------------- the dog
  const DG = (C.DG = { bodyY: 2.35, bodyR: [1.2, 1.12, 1.95], legY: 1.55, legLen: 1.55, headY: 3.85, headZ: 1.85, headR: 1.12 });
  C.makeDog = function () {
    if (!mat.skin) makeMaterials();
    const root = new THREE.Group(), J = {};
    J.body = group(root, 0, 0, 0);
    J.body.add(mesh(sph(1, 32, 22).scale(DG.bodyR[0], DG.bodyR[1], DG.bodyR[2]), mat.fur, 0, DG.bodyY, 0));
    J.body.add(mesh(sph(1, 20, 14).scale(0.95, 0.5, 1.0), mat.spot, 0.42, DG.bodyY + 0.75, -0.35));
    J.chest = mesh(sph(1, 20, 14).scale(0.95, 1.0, 0.9), mat.fur, 0, DG.bodyY + 0.35, 1.25); J.body.add(J.chest);
    J.neck = group(J.body, 0, DG.bodyY + 0.7, 1.35);
    J.collar = mesh(new THREE.TorusGeometry(0.72, 0.13, 10, 28), mat.collar, 0, 0.1, 0.05); J.collar.rotation.x = Math.PI / 2 - 0.5; J.neck.add(J.collar);
    J.tag = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), mat.gold, 0, -0.38, 0.75); J.tag.rotation.x = Math.PI / 2; J.neck.add(J.tag);
    J.head = group(J.neck, 0, DG.headY - DG.bodyY - 0.7, DG.headZ - 1.35);
    J.head.add(mesh(sph(DG.headR, 30, 20).scale(1, 0.95, 0.98), mat.fur));
    J.head.add(mesh(sph(1, 20, 14).scale(0.6, 0.5, 0.72), mat.fur, 0, -0.28, 0.92));
    J.head.add(mesh(sph(0.23, 14, 10).scale(1.2, 0.85, 0.9), mat.nose, 0, -0.08, 1.6));
    J.tongue = mesh(sph(1, 12, 8).scale(0.22, 0.08, 0.3), mat.tongue, 0, -0.62, 1.2); J.head.add(J.tongue);
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(sph(0.17, 14, 10).scale(1, 1.1, 0.6), mat.eye); e.position.set(s * 0.46, 0.25, 0.94); J.head.add(e);
      const sh = new THREE.Mesh(sph(0.05, 8, 6), mat.shine); sh.position.set(s * 0.46 + 0.05, 0.31, 1.03); J.head.add(sh);
      const ear = group(J.head, s * 0.9, 0.55, -0.05);
      ear.add(mesh(sph(1, 16, 12).scale(0.34, 0.9, 0.58), mat.spot, s * 0.12, -0.7, 0));
      ear.rotation.z = s * 0.25;
      J[s > 0 ? 'lEar' : 'rEar'] = ear;
    }
    J.legs = [];
    for (const [x, z] of [[0.68, 1.2], [-0.68, 1.2], [0.7, -1.2], [-0.7, -1.2]]) {
      const hip = group(J.body, x, DG.legY + 0.25, z);
      hip.add(mesh(limbGeo(0.36, 0.31, 0.8), mat.fur));
      const knee = group(hip, 0, -0.8, 0);
      knee.add(mesh(limbGeo(0.3, 0.27, 0.78), mat.fur));
      knee.add(mesh(sph(1, 14, 10).scale(0.36, 0.25, 0.46), mat.fur, 0, -0.82, 0.12));
      J.legs.push({ hip, knee });
    }
    J.tail = [];
    let p = group(J.body, 0, DG.bodyY + 0.65, -1.85);
    for (let i = 0; i < 3; i++) {
      const seg = group(p, 0, i ? 0.45 : 0, 0);
      seg.add(mesh(limbGeo(0.17 - i * 0.03, 0.15 - i * 0.03, 0.5).translate(0, 0.5, 0), i === 2 ? mat.spot : mat.fur));
      J.tail.push(seg); p = seg;
    }
    MV.shadows(root, true, false);
    return { root, J, kind: 'dog' };
  };
  C.DREST = { lift: 0, pitch: 0, roll: 0, yaw: 0, hx: 0, hy: 0, hz: 0, wag: 0.5, wagSpeed: 2, sit: 0, beg: 0, run: 0, tongue: 0, ears: 0, crouch: 0, hop: 0, lie: 0 };
  const DKEYS = Object.keys(C.DREST);
  C.blendDog = (a, b, k) => { const o = {}; for (const key of DKEYS) o[key] = U.lerp(a[key], b[key], k); return o; };
  C.dfull = p => Object.assign({}, C.DREST, p);

  C.applyDog = function (d, P, t, gait) {
    const J = d.J;
    const sit = P.sit, beg = P.beg;
    J.body.rotation.set(-sit * 0.55 - beg * 1.1 + P.pitch, 0, 0);
    J.body.position.set(0, P.lift + sit * -0.15 + beg * 0.55 - P.crouch * 0.5 - P.lie * 1.2, -sit * 0.6 - beg * 0.9);
    J.head.rotation.set(P.hx + sit * 0.45 + beg * 0.9, P.hy, P.hz);
    const run = P.run, ph = gait !== null && gait !== undefined ? gait : t * 9;
    J.legs.forEach((L, i) => {
      const front = i < 2, side = i % 2 ? -1 : 1;
      let a = run * Math.sin(ph + (front ? 0 : Math.PI) + (side > 0 ? 0 : 0.6)) * 0.8;
      let kb = run * Math.max(0, Math.sin(ph + (front ? 0.5 : Math.PI + 0.5))) * 0.9;
      if (!front) { a += sit * 1.35 + beg * 1.0 + P.lie * 1.4; kb += sit * -1.7 - P.lie * 1.2; }
      else { a += -sit * 0.15 + beg * (0.9 + 0.35 * Math.sin(t * 12 + side)) - P.lie * 1.3; kb += beg * 1.2 + P.lie * 0.3; }
      a += P.crouch * (front ? -0.4 : 0.6); kb += P.crouch * (front ? 0.6 : -0.9);
      L.hip.rotation.set(-a, 0, 0); L.knee.rotation.set(kb, 0, 0);
    });
    const w = Math.sin(t * TAU * P.wagSpeed) * P.wag;
    J.tail.forEach((s, i) => { s.rotation.set(i === 0 ? -0.6 + sit * 0.4 : 0.25, w * (0.5 + i * 0.3), 0); });
    J.tongue.visible = P.tongue > 0.3;
    J.lEar.rotation.z = 0.25 + P.ears * 0.5 + Math.sin(t * 8) * 0.06 * run;
    J.rEar.rotation.z = -0.25 - P.ears * 0.5 - Math.sin(t * 8 + 1) * 0.06 * run;
  };

  // ---------------------------------------------------------------- drawings (2D strokes in character space, cm)
  // Girl, front view, standing rest pose. Points are [x, y] with y up.
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 32) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; };
  const band = (pts, w) => {
    const h = w / 2, n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      L.push([pts[i][0] - dy / l * h, pts[i][1] + dx / l * h]); R.push([pts[i][0] + dy / l * h, pts[i][1] - dx / l * h]);
    }
    const e = pts[n - 1], cap = [];
    const ang = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]);
    for (let j = 1; j < 8; j++) { const a = ang - Math.PI * j / 8; cap.push([e[0] + h * Math.cos(a), e[1] + h * Math.sin(a)]); }
    return [...L, ...cap, ...R.reverse()];
  };
  C.girlDrawing = function () {
    const S = [], add = (pts, w = 0.075, fill = false) => S.push({ pts, w, fill });
    const hc = G.headC, hy = G.hipH;
    add(ell(0, hc, G.headR, G.headR * 0.97, -Math.PI / 2, Math.PI * 1.5, 48), 0.08, true);
    // hair outline + bangs
    add(ell(0, hc + 0.05, G.headR * 1.1, G.headR * 1.08, Math.PI * 1.08, -Math.PI * 0.08, 40).map(p => [p[0], p[1]]), 0.08, true);
    const bangs = []; for (let i = 0; i <= 12; i++) { const x = U.lerp(-1.45, 1.45, i / 12); bangs.push([x, hc + 0.75 + (i % 2 ? -0.32 : 0.12) - Math.abs(x) * 0.18]); }
    add(bangs, 0.07);
    add([[-1.62, hc + 0.2], [-1.6, hc - 0.9], [-1.35, hc - 1.25]], 0.07);
    add([[1.62, hc + 0.2], [1.6, hc - 0.9], [1.35, hc - 1.25]], 0.07);
    // ponytail + bow
    add([[0.6, hc + 1.55], [1.6, hc + 1.95], [2.5, hc + 1.4], [2.75, hc + 0.3], [2.35, hc - 0.6]], 0.08);
    add([[0.75, hc + 1.5], [1.7, hc + 1.4], [2.2, hc + 0.6], [2.35, hc - 0.6]], 0.07);
    add([[0.35, hc + 1.75], [-0.25, hc + 2.15], [-0.15, hc + 1.45], [0.35, hc + 1.75], [0.95, hc + 2.2], [1.0, hc + 1.5], [0.35, hc + 1.75]], 0.07, true);
    // closed sleeping eyes, blush, smile
    add(ell(-0.56, hc + 0.12, 0.3, 0.2, Math.PI * 1.1, Math.PI * 1.9, 10), 0.08);
    add(ell(0.56, hc + 0.12, 0.3, 0.2, Math.PI * 1.1, Math.PI * 1.9, 10), 0.08);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) add([[s * 0.85 + i * 0.13 - 0.13, hc - 0.38], [s * 0.85 + i * 0.13 - 0.05, hc - 0.55]], 0.04);
    add(ell(0, hc - 0.55, 0.28, 0.18, Math.PI * 1.15, Math.PI * 1.85, 10), 0.07);
    // neck
    add([[-0.28, hc - G.headR * 0.95], [-0.28, hy + G.torso]], 0.06);
    add([[0.28, hc - G.headR * 0.95], [0.28, hy + G.torso]], 0.06);
    // sweater
    const sw = [[-0.95, hy + 0.12], [-1.06, hy + 1.2], [-1.12, hy + 2.0], [-0.85, hy + 2.5], [-0.3, hy + 2.62], [0.3, hy + 2.62], [0.85, hy + 2.5], [1.12, hy + 2.0], [1.06, hy + 1.2], [0.95, hy + 0.12], [-0.95, hy + 0.12]];
    add(sw, 0.08, true);
    for (const yy of [0.55, 1.05, 1.55, 2.05]) { const hw = 1.0 + yy * 0.04; add([[-hw, hy + yy], [hw, hy + yy]], 0.05); }
    // skirt with pleats
    add([[-0.98, hy + 0.3], [0.98, hy + 0.3], [1.8, hy - 1.3], [-1.8, hy - 1.3], [-0.98, hy + 0.3]], 0.08, true);
    for (const f of [-0.6, -0.2, 0.2, 0.6]) add([[f * 0.98, hy + 0.3], [f * 1.8, hy - 1.3]], 0.04);
    // arms and hands
    for (const s of [-1, 1]) {
      const arm = [[s * 1.12, hy + 2.15], [s * 1.38, hy + 1.2], [s * 1.6, hy + 0.15]];
      add(band(arm, 0.5), 0.07, true);
      add(ell(s * 1.66, hy - 0.22, 0.3, 0.36, 0, TAU, 18), 0.07, true);
    }
    // legs, socks, shoes
    for (const s of [-1, 1]) {
      add(band([[s * G.hipW, hy - 1.3], [s * G.hipW, G.shoe + 0.05]], 0.62), 0.07, true);
      add([[s * G.hipW - 0.3, 1.25], [s * G.hipW + 0.3, 1.25]], 0.05);
      add(ell(s * (G.hipW + 0.12), 0.27, 0.55, 0.3, 0, TAU, 20), 0.08, true);
    }
    return S;
  };
  // Dog, side profile, facing forward (+h). Points are [h, v]: h forward, v up.
  C.dogDrawing = function () {
    const S = [], add = (pts, w = 0.075, fill = false) => S.push({ pts, w, fill });
    add(ell(0, DG.bodyY, DG.bodyR[2], DG.bodyR[1], Math.PI * 0.2, Math.PI * 2.2, 44), 0.08, true);
    add(ell(-0.35, DG.bodyY + 0.75, 0.9, 0.42, 0, TAU, 22), 0.06);
    add(ell(DG.headZ, DG.headY, DG.headR, DG.headR * 0.95, 0, TAU, 36), 0.08, true);
    add(ell(DG.headZ + 0.95, DG.headY - 0.3, 0.72, 0.5, -Math.PI * 0.6, Math.PI * 0.6, 16), 0.07, true);
    add(ell(DG.headZ + 1.62, DG.headY - 0.1, 0.2, 0.17, 0, TAU, 10), 0.12, true);
    add(ell(DG.headZ + 0.55, DG.headY + 0.25, 0.12, 0.12, 0, TAU, 8), 0.12, true);
    add([[DG.headZ - 0.2, DG.headY + 0.6], [DG.headZ - 0.55, DG.headY - 0.3], [DG.headZ - 0.3, DG.headY - 0.8], [DG.headZ + 0.05, DG.headY - 0.35], [DG.headZ - 0.2, DG.headY + 0.6]], 0.08, true);
    add([[DG.headZ + 0.85, DG.headY - 0.72], [DG.headZ + 1.2, DG.headY - 0.66]], 0.05);
    add([[1.0, DG.bodyY + 0.95], [1.55, DG.bodyY + 0.2]], 0.11);
    for (const z of [1.25, 0.9, -1.15, -1.5]) add(band([[z, DG.legY + 0.2], [z + 0.05, 0.15]], 0.58), 0.07, true);
    add([[-1.85, DG.bodyY + 0.6], [-2.4, DG.bodyY + 1.2], [-2.45, DG.bodyY + 1.95]], 0.09);
    return S;
  };

  // ---------------------------------------------------------------- dance moves (girl)
  // Each returns a partial pose. c = { t, bp (beat pos), ph (beat phase), bb (beat in bar), s (segment progress), e (energy) }
  const sin = Math.sin, cos = Math.cos, PI = Math.PI;
  const bounce = (ph, amt) => { const d = Math.pow((1 + cos(TAU * ph)) / 2, 1.6) * amt; return { lhx: d * 0.55, lk: d * 1.1, rhx: d * 0.55, rk: d * 1.1, sx: d * 0.15 }; };
  C.moves = {
    rest: () => ({}),
    lie: () => ({ lsz: 0.2, rsz: 0.2, le: 0.05, re: 0.05, eyes: 0.08, smile: 0.4 }),
    stretch: c => { const k = U.sstep(0, 0.5, c.s); return { lsz: U.lerp(0.2, 2.9, k), rsz: U.lerp(0.2, 2.9, k), le: 0.2, re: 0.2, sx: -0.15 * k, hx: -0.25 * k, eyes: 0.15 + 0.85 * U.sstep(0.55, 0.8, c.s), open: k * (1 - U.sstep(0.6, 0.9, c.s)) * 0.9, smile: 0.2 }; },
    phoneLook: c => ({ phone: 1, rsx: 1.15, rsz: 0.05, re: 1.55, rsy: 0.25, rwx: -0.35, lsx: 0.5, lsz: 0.2, le: 1.3, hx: 0.2, hy: 0.05, smile: 0.1, sx: 0.08 }),
    facepalm: c => ({ phone: 1, rsx: 0.3, re: 0.6, lsx: 1.3, lsz: 0.35, le: 2.2, lsy: -0.5, hx: 0.3, hz: 0.12, sx: 0.25, smile: -0.7 }),
    slump: c => Object.assign(bounce(c.ph, 0.1), { phone: 1, rsx: 0.15, re: 0.3, lsx: 0.1, le: 0.2, sx: 0.35, hx: 0.45, smile: -0.8, lsz: 0.05, rsz: 0.05 }),
    selfie: c => { const b = bounce(c.ph, 0.35); return Object.assign(b, { phone: 1, rsx: 1.45, rsz: 0.55, re: 1.1, rsy: -0.2, rwx: 0.4, lsx: 0.4, lsz: 1.9, le: 1.8, hz: 0.2 * sin(c.bp * PI), hy: -0.25, smile: 1, open: 0.15 }); },
    forcedSmile: c => ({ phone: 1, rsx: 1.45, rsz: 0.55, re: 1.1, rsy: -0.2, rwx: 0.4, lsx: 0.15, lsz: 0.25, le: 0.3, hy: -0.25, hz: 0.12, smile: 1, open: 0.05, eyes: 0.75 }),
    sitPhone: c => ({ hipsY: 0.75, lhx: 1.45, lk: 2.1, lhz: 0.55, rhx: 1.45, rk: 2.1, rhz: 0.55, phone: 1, rsx: 0.85, re: 1.25, rsz: 0.1, rsy: 0.35, rwx: -0.6, lsx: 0.75, le: 1.3, lsz: 0.15, lsy: -0.35, hx: 0.32, sx: 0.22, smile: 0.0 }),
    refresh: c => { const d = Math.pow(U.c01(1 - c.ph * 2.2), 2); return { hipsY: 0.75, lhx: 1.45, lk: 2.1, lhz: 0.55, rhx: 1.45, rk: 2.1, rhz: 0.55, phone: 1, rsx: 0.85, re: 1.25, rsy: 0.35, rwx: -0.6, lsx: 0.95 - d * 0.5, le: 1.5 - d * 0.6, lsy: -0.35, hx: 0.32, sx: 0.22, smile: -0.2 }; },
    point: c => { const k = U.out3(U.c01(c.s * 4)); return Object.assign(bounce(c.ph, 0.2), { rsx: 1.55 * k, rsz: 0.15, re: 0.05, lsx: 0.2, lsz: 0.75, le: 1.9, lsy: 0.6, hx: -0.1, hz: 0.12, smile: 0.9, sx: -0.06 }); },
    freeze: c => ({ rsx: 1.55, rsz: 0.15, re: 0.05, lsx: 0.2, lsz: 0.75, le: 1.9, lsy: 0.6, hz: 0.12, smile: 0.9, open: 0.4 }),
    hype: c => {
      const b = bounce(c.ph, 0.45), alt = c.bb % 2 ? 1 : -1, up = Math.pow((1 + cos(TAU * c.ph)) / 2, 2);
      return Object.assign(b, { lsz: 1.0 + 1.6 * (alt > 0 ? up : 0.2), le: 0.4 + (alt > 0 ? 0 : 1.2), rsz: 1.0 + 1.6 * (alt < 0 ? up : 0.2), re: 0.4 + (alt < 0 ? 0 : 1.2),
        hx: -0.12 + 0.18 * up, hz: 0.18 * alt, sz: 0.1 * alt, smile: 1, ponyKick: 1, ox: 0.25 * sin(c.bp * PI * 0.5), lift: 0.35 * Math.max(0, sin(TAU * c.ph - PI / 2)) * (c.bb === 0 ? 1 : 0) });
    },
    sway: c => { const s = sin(c.bp * PI); return { sz: 0.12 * s, ox: 0.35 * s, hz: -0.15 * s, lsz: 0.35 + 0.15 * s, rsz: 0.35 - 0.15 * s, le: 0.5, re: 0.5, lhz: 0.05 + 0.06 * s, rhz: 0.05 - 0.06 * s, smile: 0.7, ponyKick: 0.3 }; },
    swipe: c => {
      // big arm swipe across the body on each beat, alternating
      const alt = Math.floor(c.bp) % 2 ? 1 : -1, k = U.inOut(U.c01(c.ph * 1.6));
      const a = alt > 0 ? U.lerp(-1, 1, k) : U.lerp(1, -1, k);
      return Object.assign(bounce(c.ph, 0.3), { rsx: 1.4, rsz: 0.2 + 0.6 * a, rsy: -0.8 * a, re: 0.25, lsx: 0.3, lsz: 0.5, le: 1.6, sy: -0.25 * a, hy: -0.2 * a, smile: 0.8, ponyKick: 0.8 });
    },
    heartHands: c => Object.assign(bounce(c.ph, 0.3), { lsz: 2.45, rsz: 2.45, lsx: 0.4, rsx: 0.4, le: 1.75, re: 1.75, lsy: 0.6, rsy: -0.6, hz: 0.15 * sin(c.bp * PI), smile: 1, ponyKick: 0.6 }),
    spin: c => Object.assign(bounce(c.ph, 0.25), { yaw: U.inOut(U.c01(c.s)) * TAU, lsz: 1.4, rsz: 1.4, le: 0.3, re: 0.3, lift: 0.6 * sin(PI * U.c01(c.s)), smile: 1, ponyKick: 1.2 }),
    jumpSpin: c => { const k = U.c01(c.s * 1.25); return { yaw: U.inOut(k) * TAU, lift: 2.6 * 4 * k * (1 - k), lhx: 0.9 * sin(PI * k), lk: 1.6 * sin(PI * k), rhx: 0.5 * sin(PI * k), rk: 1.2 * sin(PI * k), lsz: 2.6, rsz: 2.6, le: 0.2, re: 0.2, smile: 1, open: 0.6, ponyKick: 1.5 }; },
    wave: c => Object.assign(bounce(c.ph, 0.2), { rsz: 2.5, rsx: 0.2, re: 0.6 + 0.45 * sin(c.t * 12), lsz: 0.25, le: 0.3, smile: 1, hz: 0.12 }),
    walk: c => { const ph = (c.stride !== undefined ? c.stride / 2.3 : c.t * 1.1) * TAU; return { lhx: 0.45 * sin(ph), rhx: -0.45 * sin(ph), lk: 0.6 * Math.max(0, -sin(ph)), rk: 0.6 * Math.max(0, sin(ph)), lsx: -0.45 * sin(ph), rsx: 0.45 * sin(ph), le: 0.4, re: 0.4, lift: 0.08 * Math.abs(cos(ph)), smile: 0.6 }; },
    cry: c => ({ hipsY: 0.75, lhx: 1.9, lk: 2.5, lhz: 0.15, rhx: 1.9, rk: 2.5, rhz: 0.15, lsx: 1.1, le: 1.95, lsz: 0.25, rsx: 1.1, re: 1.95, rsz: 0.25, hx: 0.25 + 0.05 * sin(c.t * 9), sx: 0.3, smile: -0.9, eyes: 0.35, tears: 1, phone: 0 }),
    cryPhone: c => ({ hipsY: 0.75, lhx: 1.9, lk: 2.5, lhz: 0.15, rhx: 1.9, rk: 2.5, rhz: 0.15, phone: 1, rsx: 1.25, re: 1.6, rsy: 0.3, rwx: -0.3, lsx: 1.1, le: 1.95, lsz: 0.25, hx: 0.1, sx: 0.22, smile: -0.8, eyes: 0.5, tears: 1 }),
    lapDog: c => ({ hipsY: 0.75, lhx: 1.45, lk: 2.1, lhz: 0.55, rhx: 1.45, rk: 2.1, rhz: 0.55, lsx: 0.9, le: 1.2, lsz: 0.5, rsx: 0.9, re: 1.1, rsz: 0.4, hx: 0.45, hz: 0.15, sx: 0.25, smile: 0.35, eyes: 0.6, tears: 0.3 * (1 - c.s) }),
    lookUp: c => ({ hipsY: 0.75, lhx: 1.45, lk: 2.1, lhz: 0.55, rhx: 1.45, rk: 2.1, rhz: 0.55, lsx: 0.5, le: 0.9, rsx: 0.5, re: 0.9, hx: -0.35, sx: -0.05, smile: 0.1, eyes: 1 }),
    throwPhone: c => { const k = U.c01(c.s * 2); return { rsx: U.lerp(2.6, 0.9, U.out3(k)), rsz: 0.4, re: U.lerp(1.4, 0.1, k), phone: k < 0.45 ? 1 : 0, lsz: 0.5, le: 0.5, sy: U.lerp(0.4, -0.4, k), hy: -0.3, smile: -0.5, open: 0.4 }; },
    catchPhone: c => ({ phone: 1, rsx: 1.0, re: 1.5, rsy: 0.25, lsx: 0.7, le: 1.2, hx: 0.35, smile: -0.2, sx: 0.12 }),
    shrug: c => Object.assign(bounce(c.ph, 0.15), { lsz: 0.6, rsz: 0.6, le: 1.7, re: 1.7, lsy: 0.9, rsy: -0.9, hz: 0.25, smile: 0.4, open: 0.2, sz: -0.06 }),
    extra: c => { const b = bounce(c.ph, 0.5), alt = c.bb % 2 ? 1 : -1; return Object.assign(b, { glasses: 1, lsz: 2.3, rsz: 0.7, re: 1.4, le: 0.3, rsx: 0.8, hz: 0.25 * alt, sz: 0.15 * alt, smile: 1, open: 0.3, ponyKick: 1.2, ox: 0.4 * alt }); },
    pose: c => ({ lsz: 2.2, le: 1.6, lsy: 0.5, rsz: 0.5, re: 1.9, rsy: -0.9, hz: 0.25, hy: -0.2, sz: 0.12, lhz: 0.18, smile: 1, glasses: c.glasses ? 1 : 0 }),
    throwBall: c => { const k = U.c01(c.s * 2.5); return Object.assign(bounce(c.ph, 0.2), { rsx: U.lerp(-0.6, 2.4, U.out3(k)), re: U.lerp(1.6, 0.1, k), rsz: 0.3, lsz: 0.5, le: 0.6, sy: U.lerp(0.25, -0.2, k), smile: 1, open: 0.5 }); },
    hugDog: c => ({ hipsY: 1.1, lhx: 1.75, lk: 2.6, rhx: 0.4, rk: 2.4, rhz: 0.3, lhz: 0.2, lsx: 1.25, le: 1.45, lsz: 0.35, rsx: 1.25, re: 1.45, rsz: 0.35, sx: 0.55, hx: 0.3, hz: 0.25, smile: 1, eyes: 0.2 }),
    bow: c => { const k = U.sstep(0, 0.5, c.s) * (1 - U.sstep(0.6, 1, c.s)); return { sx: 0.9 * k, hx: 0.3 * k, lsx: 0.3 * k, rsx: 0.3 * k, lsz: 0.3, rsz: 0.3, smile: 1 }; },
    surf: c => ({ lhx: 0.55, lk: 1.05, rhx: 0.2, rk: 0.8, lhz: 0.28, rhz: 0.28, lsz: 1.45, rsz: 1.15, le: 0.35, re: 0.3, lsx: 0.2, sy: 0.45, hy: -0.4, sx: 0.12, smile: 1, open: 0.3, ponyKick: 1.3, lift: 0.1 * Math.sin(c.bp * Math.PI) }),
    phoneEar: c => ({ phone: 1, rsx: 0.55, rsz: 0.35, re: 2.45, rsy: -0.45, rwx: 0.3, lsz: 0.3, le: 0.4, hz: 0.22, hx: 0.1, smile: c.happy ? 1 : -0.3, open: c.happy ? 0.25 : 0, eyes: c.happy ? 0.8 : 1 }),
    oneMore: c => Object.assign(bounce(c.ph, 0.15), { phone: 1, rsx: 0.9, re: 1.2, rsy: 0.2, lsz: 2.35, lsx: 0.4, le: 0.15, hz: -0.2, hy: 0.35, smile: 0.6, open: 0.3 }),
    duo: c => { const b = bounce(c.ph, 0.4), s = sin(c.bp * PI); return Object.assign(b, { lsz: 0.8 + 0.5 * Math.max(0, s), rsz: 0.8 + 0.5 * Math.max(0, -s), le: 1.3, re: 1.3, lsx: 0.6, rsx: 0.6, sy: 0.2 * s, hz: 0.18 * s, ox: 0.3 * s, smile: 1, open: 0.2, ponyKick: 0.9 }); },
  };
  // hands and arm targets for each move (arm targets are solved by inverse kinematics in physics.js)
  (function () {
    const M = C.moves;
    const wrap = (name, extra) => { const f = M[name]; M[name] = c => Object.assign(f(c), typeof extra === 'function' ? extra(c) : extra); };
    wrap('phoneLook', { ikPhone: 1, aim: 1, rCurl: 0.6, lCurl: 0.3 });
    wrap('catchPhone', { ikPhone: 0.85, aim: 1, rCurl: 0.6 });
    wrap('facepalm', { ikFace: 1, lCurl: 0.25, rCurl: 0.6 });
    wrap('slump', { rCurl: 0.6, lCurl: 0.45 });
    wrap('selfie', { ikSelfie: 1, aim: 1, rCurl: 0.6, lCurl: 0.95, lIdx: 1, lMid: 1 });
    wrap('forcedSmile', { ikSelfie: 1, aim: 1, rCurl: 0.6, lCurl: 0.4 });
    wrap('oneMore', { lCurl: 1, lIdx: 1, ikPhone: 0.6, aim: 0.8 });
    wrap('sitPhone', { ikLap: 1, aim: 1, rCurl: 0.6, lCurl: 0.45 });
    wrap('refresh', c => ({ ikLap: 1, aim: 1, rCurl: 0.6, lCurl: 0.9, lIdx: 1 - Math.pow(U.c01(1 - c.ph * 2.2), 2) * 0.3 }));
    wrap('cryPhone', { ikPhone: 1, aim: 1, rCurl: 0.6, lCurl: 0.7 });
    wrap('phoneEar', { ikEar: 1, rCurl: 0.6, lCurl: 0.3 });
    wrap('point', { rCurl: 1, rIdx: 1, lCurl: 0.75 });
    wrap('freeze', { rCurl: 1, rIdx: 1, lCurl: 0.75 });
    wrap('heartHands', { ikHeart: 1, lCurl: 0.6, rCurl: 0.6 });
    wrap('hugDog', { ikHug: 1, lCurl: 0.3, rCurl: 0.3 });
    wrap('wave', { rCurl: 0.05, lCurl: 0.4 });
    wrap('stretch', { lCurl: 0.1, rCurl: 0.1 });
    wrap('hype', c => ({ lCurl: 0.85, rCurl: 0.85, lIdx: c.bb % 2 ? 1 : 0, rIdx: c.bb % 2 ? 0 : 1 }));
    wrap('extra', { lCurl: 0.95, lIdx: 1, lMid: 1, rCurl: 0.2 });
    wrap('pose', { lCurl: 0.95, lIdx: 1, lMid: 1, rCurl: 0.3 });
    wrap('throwBall', { rCurl: 0.5 });
    wrap('lapDog', { lCurl: 0.2, rCurl: 0.2 });
    wrap('cry', { lCurl: 0.5, rCurl: 0.5 });
    wrap('swipe', { rCurl: 0.1, lCurl: 0.5 });
    wrap('jumpSpin', { lCurl: 0.1, rCurl: 0.1 });
    wrap('spin', { lCurl: 0.1, rCurl: 0.1 });
    wrap('surf', { lCurl: 0.15, rCurl: 0.15 });
    wrap('shrug', { lCurl: 0.1, rCurl: 0.1 });
  })();

  C.dogMoves = {
    rest: () => ({}),
    lie: () => ({ wag: 0, eyes: 0 }),
    sit: c => ({ sit: 1, wag: 0.5, tongue: 1, hy: 0.25 * sin(c.t * 0.9) }),
    wag: c => ({ wag: 0.8, wagSpeed: 3, tongue: 1, hx: 0.08 * sin(c.bp * PI * 2) }),
    hop: c => { const h = Math.max(0, sin(TAU * c.ph - PI / 2 + PI)); return { lift: 0.9 * Math.pow(Math.max(0, sin(PI * c.ph)), 1.2), crouch: Math.max(0, cos(TAU * c.ph)) * 0.4, wag: 1, wagSpeed: 4, tongue: 1, ears: 0.6 * sin(PI * c.ph), hx: -0.15 }; },
    beg: c => ({ beg: 1, wag: 1, wagSpeed: 4, tongue: 1, hx: -0.1 * sin(c.bp * PI) }),
    run: c => ({ run: 1, wag: 0.6, wagSpeed: 5, tongue: 1, ears: 0.5, lift: 0.25 * Math.abs(sin(c.t * 9)) }),
    nudge: c => ({ crouch: 0.5, hx: 0.35 + 0.15 * sin(c.t * 5), wag: 0.7, wagSpeed: 3 }),
    sad: c => ({ lie: 0.6, hx: 0.25, wag: 0.05, ears: -0.3 }),
    lapHead: c => ({ lie: 0.75, hx: -0.15, hz: 0.2, wag: 0.25, wagSpeed: 1.5 }),
    spin: c => ({ yaw: U.inOut(U.c01(c.s)) * TAU * 2, run: 0.8, wag: 1, wagSpeed: 5, tongue: 1 }),
    catch: c => { const k = U.c01(c.s * 1.4); return { lift: 3.2 * sin(PI * k), pitch: -0.5 * sin(PI * k), hx: -0.5, wag: 1, wagSpeed: 6, tongue: 1, ears: 0.8 }; },
    dance: c => ({ beg: 0.6 + 0.4 * Math.max(0, sin(TAU * c.ph)), wag: 1, wagSpeed: 4, tongue: 1, hz: 0.2 * sin(c.bp * PI), hy: 0.2 * sin(c.bp * PI) }),
  };
})();
