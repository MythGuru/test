/* TikTok Famous: the world (desk, paper, ring light, phone, pencils, lights) */
(function () {
  const MV = window.MV, U = MV.U;
  const W = (MV.world = {});

  // ---------------------------------------------------------------- shared helpers
  MV.L_POP = 1; MV.L_SCREEN = 3;
  MV.canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  MV.tex = (c, srgb = true) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = MV.renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const rnd = (() => { let s = 1234567; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  MV.rnd = rnd;

  // graphite outline: an inverted hull pushed out along normals
  MV.ink = { width: { value: 0.045 }, color: { value: new THREE.Color(0x1d1c22) } };
  const outlineMat = new THREE.ShaderMaterial({
    uniforms: { uW: MV.ink.width, uC: MV.ink.color, uScale: { value: 1 } },
    vertexShader: `uniform float uW; void main(){ vec3 p = position + normal * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
    fragmentShader: `uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, 1.0); }`,
    side: THREE.BackSide,
  });
  MV.outlined = mesh => {
    const o = new THREE.Mesh(mesh.geometry, outlineMat);
    o.userData.outline = true;
    o.castShadow = false;
    mesh.add(o);
    return mesh;
  };
  MV.setLayers = (obj, pop) => obj.traverse(o => { o.layers.set(0); if (pop) o.layers.enable(MV.L_POP); });
  MV.shadows = (obj, cast = true, receive = false) => obj.traverse(o => { if (o.isMesh && !o.userData.outline) { o.castShadow = cast; o.receiveShadow = receive; } });

  // ---------------------------------------------------------------- textures
  function woodTextures() {
    const w = 2048, h = 1024, c = MV.canvas(w, h), x = c.getContext('2d');
    const rc = MV.canvas(w, h), rx = rc.getContext('2d');
    rx.fillStyle = '#9a9a9a'; rx.fillRect(0, 0, w, h);
    const planks = 7, ph = h / planks;
    for (let p = 0; p < planks; p++) {
      const y0 = p * ph, tone = 0.8 + rnd() * 0.35;
      const base = [86 * tone, 74 * tone, 62 * tone];
      x.fillStyle = `rgb(${base.map(Math.round).join(',')})`;
      x.fillRect(0, y0, w, ph);
      for (let i = 0; i < 90; i++) {
        const yy = y0 + rnd() * ph, amp = 1 + rnd() * 5, fq = 0.002 + rnd() * 0.006, phs = rnd() * 6.28;
        const dark = rnd() < 0.6;
        x.strokeStyle = dark ? `rgba(28,22,18,${0.08 + rnd() * 0.22})` : `rgba(190,175,155,${0.05 + rnd() * 0.12})`;
        x.lineWidth = 0.6 + rnd() * 2.4;
        x.beginPath();
        for (let u = 0; u <= w; u += 12) {
          const v = yy + amp * Math.sin(u * fq * 6.28 + phs) + 3 * Math.sin(u * 0.003 + i);
          u ? x.lineTo(u, v) : x.moveTo(u, v);
        }
        x.stroke();
      }
      // knots
      for (let k = 0; k < 2; k++) {
        const kx = rnd() * w, ky = y0 + ph * (0.3 + rnd() * 0.4), r = 8 + rnd() * 18;
        for (let j = 0; j < 7; j++) {
          x.strokeStyle = `rgba(30,22,16,${0.25 - j * 0.03})`; x.lineWidth = 2;
          x.beginPath(); x.ellipse(kx, ky, r + j * 6, (r + j * 6) * 0.45, 0, 0, 6.283); x.stroke();
        }
      }
      // weathering: pale streaks
      for (let i = 0; i < 260; i++) {
        x.fillStyle = `rgba(210,200,185,${rnd() * 0.06})`;
        x.fillRect(rnd() * w, y0 + rnd() * ph, 30 + rnd() * 200, 1 + rnd() * 2);
      }
      // gap between planks
      x.fillStyle = 'rgba(8,6,5,0.95)'; x.fillRect(0, y0, w, 4);
      rx.fillStyle = '#ffffff'; rx.fillRect(0, y0, w, 4);
      for (let i = 0; i < 400; i++) { rx.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '40,40,40'},${rnd() * 0.25})`; rx.fillRect(rnd() * w, y0 + rnd() * ph, 20 + rnd() * 160, 1 + rnd() * 3); }
    }
    // scratches
    for (let i = 0; i < 160; i++) {
      x.strokeStyle = `rgba(220,210,195,${rnd() * 0.12})`; x.lineWidth = 0.7;
      const sx = rnd() * w, sy = rnd() * h, a = rnd() * 6.28, l = 10 + rnd() * 80;
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke();
    }
    return { map: MV.tex(c), rough: MV.tex(rc, false) };
  }

  function paperTexture() {
    const w = 2048, h = 1448, c = MV.canvas(w, h), x = c.getContext('2d');
    x.fillStyle = '#e4e1d8'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) {
      x.fillStyle = `rgba(${rnd() < 0.5 ? '120,110,96' : '255,255,255'},${rnd() * 0.05})`;
      x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd());
    }
    for (let i = 0; i < 300; i++) {
      x.strokeStyle = `rgba(140,130,115,${rnd() * 0.05})`; x.lineWidth = 0.6;
      const sx = rnd() * w, sy = rnd() * h, a = rnd() * 6.28;
      x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + 6, sy + 4, sx + Math.cos(a) * 18, sy + Math.sin(a) * 18); x.stroke();
    }
    // soft edge darkening
    const g = x.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,80,60,0.12)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    return MV.tex(c);
  }

  function radial(colorInner, colorOuter, size = 128) {
    const c = MV.canvas(size, size), x = c.getContext('2d');
    const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, colorInner); g.addColorStop(0.55, colorOuter); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    return MV.tex(c);
  }
  MV.radialTex = radial;

  // ---------------------------------------------------------------- build
  W.build = function (scene) {
    W.PAPER_W = 42; W.PAPER_H = 29.7; W.PAPER_Y = 0.08;

    // desk
    const wt = woodTextures();
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(220, 120),
      new THREE.MeshStandardMaterial({ map: wt.map, roughnessMap: wt.rough, roughness: 0.78, metalness: 0.0, color: 0xc9c2b8 }));
    desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true;
    scene.add(desk);
    // desk front edge (thickness) for low shots
    const edge = new THREE.Mesh(new THREE.BoxGeometry(220, 4, 1), new THREE.MeshStandardMaterial({ map: wt.map, color: 0x6d655c, roughness: 0.8 }));
    edge.position.set(0, -2, 60); scene.add(edge);

    // back wall and bokeh fairy lights
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 1 }));
    wall.position.set(0, 60, -95); scene.add(wall);
    const bokehTex = radial('rgba(255,255,255,1)', 'rgba(255,255,255,0.35)', 128);
    W.bokeh = [];
    const bokehCols = [0xffc27a, 0xffa860, 0xffd9a0, 0xff8fb8, 0x9fd1ff];
    for (let i = 0; i < 26; i++) {
      const m = new THREE.SpriteMaterial({ map: bokehTex, color: bokehCols[i % bokehCols.length], transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3 });
      const s = new THREE.Sprite(m);
      s.position.set(-120 + rnd() * 240, 14 + rnd() * 60, -70 - rnd() * 22);
      const sz = 7 + rnd() * 12; s.scale.set(sz, sz, 1);
      s.userData.base = 0.12 + rnd() * 0.22; s.userData.ph = rnd() * 6.28;
      scene.add(s); W.bokeh.push(s);
    }

    // paper with a gentle curl
    const pg = new THREE.PlaneGeometry(W.PAPER_W, W.PAPER_H, 48, 34);
    const pos = pg.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i);
      const cx = Math.max(0, Math.abs(px) - W.PAPER_W * 0.42), cy = Math.max(0, Math.abs(py) - W.PAPER_H * 0.4);
      pos.setZ(i, (cx * cx + cy * cy) * 0.09);
    }
    pg.computeVertexNormals();
    const paper = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: paperTexture(), roughness: 0.93, metalness: 0 }));
    paper.rotation.x = -Math.PI / 2; paper.position.y = W.PAPER_Y; paper.receiveShadow = true; paper.castShadow = true;
    scene.add(paper); W.paper = paper;

    // ink layer: the pencil drawing lives here
    W.inkCanvas = MV.canvas(2048, 1448); W.inkCtx = W.inkCanvas.getContext('2d');
    W.inkTex = MV.tex(W.inkCanvas);
    const inkMat = new THREE.MeshStandardMaterial({ map: W.inkTex, transparent: true, roughness: 0.55, metalness: 0.15, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const ink = new THREE.Mesh(pg, inkMat);
    ink.rotation.x = -Math.PI / 2; ink.position.y = W.PAPER_Y + 0.012; ink.receiveShadow = true;
    scene.add(ink); W.ink = ink;
    // notes layer: text the pencil writes later (title, numbers)
    W.noteCanvas = MV.canvas(2048, 1448); W.noteCtx = W.noteCanvas.getContext('2d');
    W.noteTex = MV.tex(W.noteCanvas);
    const note = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: W.noteTex, transparent: true, roughness: 0.55, metalness: 0.15, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
    note.rotation.x = -Math.PI / 2; note.position.y = W.PAPER_Y + 0.016;
    scene.add(note); W.note = note;
    W.toPaper = (wx, wz) => [((wx + W.PAPER_W / 2) / W.PAPER_W) * 2048, ((wz + W.PAPER_H / 2) / W.PAPER_H) * 1448];

    // ---------------------------------------------------------------- lights
    W.hemi = new THREE.HemisphereLight(0x9fb3d6, 0x2a2018, 0.25);
    scene.add(W.hemi);
    const key = new THREE.DirectionalLight(0xbfd2ff, 0.9);
    key.position.set(-34, 52, -26);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 10, far: 160 });
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
    scene.add(key, key.target); W.key = key;
    const fill = new THREE.DirectionalLight(0xffe0c4, 0.12);
    fill.position.set(30, 25, 40); scene.add(fill); W.fill = fill;
    W.rimA = new THREE.PointLight(0xff3d8b, 0, 70, 1.6); W.rimA.position.set(-22, 14, -14);
    W.rimB = new THREE.PointLight(0x37d5ff, 0, 70, 1.6); W.rimB.position.set(22, 14, -10);
    scene.add(W.rimA, W.rimB);

    // ---------------------------------------------------------------- ring light
    const ring = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.35, metalness: 0.8 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.8, 48), metal); base.position.y = 0.4;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 13, 16), metal); pole.position.y = 7;
    const yoke = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 8, 24, Math.PI), metal); yoke.position.y = 13.4;
    ring.add(base, pole, yoke);
    const head = new THREE.Group(); head.position.y = 14.5; ring.add(head);
    W.ringMat = new THREE.MeshStandardMaterial({ color: 0xf6f2ea, emissive: 0xfff3e2, emissiveIntensity: 0, roughness: 0.4 });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.75, 20, 96), W.ringMat);
    const housing = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.95, 12, 96, Math.PI * 2), metal);
    housing.position.z = -0.35; housing.scale.set(1, 1, 0.6);
    head.add(housing, torus);
    // phone clamp in the middle of the ring
    const bar = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.25, 0.25), metal); head.add(bar);
    const holder = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.6), metal); head.add(holder);
    W.ringPhone = makePhone(3.4, 7.0, 0.42);
    W.ringPhone.position.z = 0.45; head.add(W.ringPhone);
    ring.position.set(13, 0, 12);
    ring.lookAt(0, 0, 2);
    head.rotation.x = 0.22;
    scene.add(ring); W.ring = ring; W.ringHead = head;
    MV.shadows(ring, true, false); torus.castShadow = false;
    W.ringLight = new THREE.PointLight(0xfff1df, 0, 90, 1.3);
    head.add(W.ringLight);
    // volumetric beam
    const beamGeo = new THREE.CylinderGeometry(7, 15, 26, 48, 1, true);
    beamGeo.translate(0, -13, 0); beamGeo.rotateX(-Math.PI / 2);
    W.beamMat = new THREE.ShaderMaterial({
      uniforms: { uO: { value: 0 }, uC: { value: new THREE.Color(0xfff0dc) } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vZ; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); vZ=position.z; gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform float uO; uniform vec3 uC; varying vec3 vN; varying vec3 vV; varying float vZ; void main(){ float f = pow(abs(dot(vN,vV)), 1.6); float fall = smoothstep(26.0, 0.0, vZ); gl_FragColor = vec4(uC * f * fall * uO, 1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide,
    });
    const beam = new THREE.Mesh(beamGeo, W.beamMat);
    head.add(beam);

    // ---------------------------------------------------------------- desk phone (shows the live feed)
    W.deskPhone = makePhone(7.4, 15.4, 0.8, true);
    W.deskPhone.position.set(-27, 0.4, 9);
    W.deskPhone.rotation.set(-Math.PI / 2, 0, 0.32);
    scene.add(W.deskPhone);
    MV.shadows(W.deskPhone, true, true);
    W.phoneGlow = new THREE.PointLight(0x7fb0ff, 0, 30, 2);
    W.phoneGlow.position.set(-27, 4, 9); scene.add(W.phoneGlow);

    // ---------------------------------------------------------------- pencils
    W.pencil = makePencil(0xf0a514, 0x2a2a2f, true);
    scene.add(W.pencil.root);
    W.colorPencils = [0xff4f9a, 0x2fd0ff, 0xffd23a, 0x9a6bff].map((c, i) => {
      const p = makePencil(c, c, false);
      p.rest = new THREE.Vector3(-22 + i * 1.4, 0.36, 18 + i * 0.25);
      p.root.position.copy(p.rest);
      p.root.rotation.set(0, 0.25 + i * 0.03, 0);
      p.tilt.rotation.set(0, 0, Math.PI / 2);
      scene.add(p.root);
      return p;
    });
    // light trails for the coloured pencils
    const trailGeo = new THREE.SphereGeometry(0.11, 8, 6);
    W.trails = W.colorPencils.map(p => {
      const col = p.color;
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
      const im = new THREE.InstancedMesh(trailGeo, m, 96);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false; im.count = 0;
      scene.add(im);
      return im;
    });
  };

  function roundedRect(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  MV.roundedRect = roundedRect;

  // A phone: body, glass screen (feed + UI overlay), camera bump on the back.
  function makePhone(w, h, d, withUI) {
    const g = new THREE.Group();
    const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(w, h, w * 0.16), { depth: d, bevelEnabled: true, bevelThickness: d * 0.18, bevelSize: d * 0.18, bevelSegments: 3, curveSegments: 10 });
    bodyGeo.translate(0, 0, -d / 2);
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: 0x1c1d22, roughness: 0.3, metalness: 0.6, clearcoat: 0.8 }));
    g.add(body);
    const sw = w * 0.92, sh = h * 0.95;
    const screenGeo = new THREE.ShapeGeometry(roundedRect(sw, sh, sw * 0.12), 8);
    // UVs for the shape: map x,y to 0..1
    const sp = screenGeo.attributes.position, uv = screenGeo.attributes.uv;
    for (let i = 0; i < sp.count; i++) uv.setXY(i, sp.getX(i) / sw + 0.5, sp.getY(i) / sh + 0.5);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = d / 2 + d * 0.19;
    screen.layers.set(MV.L_SCREEN);
    g.add(screen);
    g.userData.screen = screen;
    if (withUI) {
      const ui = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      ui.position.z = screen.position.z + 0.02;
      ui.layers.set(MV.L_SCREEN);
      g.add(ui); g.userData.ui = ui;
    }
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.09, w * 0.09, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.1, metalness: 0.9 }));
    lens.rotation.x = Math.PI / 2; lens.position.set(-w * 0.28, h * 0.4, -d / 2 - d * 0.2);
    g.add(lens);
    return g;
  }
  MV.makePhone = makePhone;

  // A pencil built along +Y with the tip at the origin, inside a tilt group.
  function makePencil(bodyColor, leadColor, hex) {
    const root = new THREE.Group(), tilt = new THREE.Group(); root.add(tilt);
    const add = (geo, mat, y, flip) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; if (flip) m.rotation.x = Math.PI; m.castShadow = true; tilt.add(m); return m; };
    const segs = hex ? 6 : 14;
    add(new THREE.ConeGeometry(0.09, 0.34, 12), new THREE.MeshStandardMaterial({ color: leadColor, roughness: 0.35, metalness: hex ? 0.4 : 0.05 }), 0.17, true);
    add(new THREE.ConeGeometry(0.38, 1.7, segs, 1, true), new THREE.MeshStandardMaterial({ color: 0xd9b48a, roughness: 0.85, flatShading: hex }), 0.85, true);
    add(new THREE.CylinderGeometry(0.38, 0.38, 13.5, segs), new THREE.MeshPhysicalMaterial({ color: bodyColor, roughness: 0.35, clearcoat: 0.7, flatShading: hex }), 1.7 + 6.75);
    if (hex) {
      const fer = new THREE.MeshStandardMaterial({ color: 0xc8cbd1, roughness: 0.25, metalness: 0.95 });
      add(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 28), fer, 15.0);
      for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.4, 0.035, 6, 28), fer, 14.6 + i * 0.4).rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.37, 0.37, 0.85, 28), new THREE.MeshStandardMaterial({ color: 0xe58b88, roughness: 0.9 }), 16.0);
    } else {
      add(new THREE.SphereGeometry(0.38, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: bodyColor, roughness: 0.35, clearcoat: 0.7 }), 15.45);
    }
    tilt.rotation.set(0.3, 0, -0.55);
    return { root, tilt, color: bodyColor };
  }
  MV.makePencil = makePencil;
})();
