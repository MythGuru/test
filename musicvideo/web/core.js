/* TikTok Famous: core (math, beat clock, renderer, post-processing) */
(function () {
  const MV = (window.MV = window.MV || {});
  const D = window.MVDATA;

  // ------------------------------------------------------------------ math
  const U = (MV.U = {});
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.c01 = v => Math.max(0, Math.min(1, v));
  U.lerp = (a, b, k) => a + (b - a) * k;
  U.range = (t, a, b) => U.c01((t - a) / (b - a));
  U.smooth = k => k * k * (3 - 2 * k);
  U.sstep = (a, b, t) => U.smooth(U.range(t, a, b));
  U.inOut = s => (s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2);
  U.inOut3 = s => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
  U.out = s => 1 - (1 - s) * (1 - s);
  U.out3 = s => 1 - Math.pow(1 - s, 3);
  U.in2 = s => s * s;
  U.back = s => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(s - 1, 3) + c1 * Math.pow(s - 1, 2); };
  U.elastic = s => (s === 0 || s === 1 ? s : Math.pow(2, -10 * s) * Math.sin((s * 10 - 0.75) * (2 * Math.PI / 3)) + 1);
  // envelope: 0 before a, rises over fi, holds, falls over fo ending at b
  U.env = (t, a, b, fi = 0.25, fo = 0.25) => Math.min(U.range(t, a, a + fi), 1 - U.range(t, b - fo, b));
  U.hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return s - Math.floor(s); };
  U.hash2 = (a, b) => U.hash(a * 57.31 + b * 113.97);
  U.noise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return U.lerp(U.hash(i), U.hash(i + 1), u) * 2 - 1; };
  U.fbm = x => U.noise(x) * 0.6 + U.noise(x * 2.13 + 7) * 0.3 + U.noise(x * 4.7 + 3) * 0.1;
  U.TAU = Math.PI * 2;
  U.deg = Math.PI / 180;

  // ------------------------------------------------------------------ beats
  const BEATS = D.beats, NB = BEATS.length;
  const P0 = (BEATS[8] - BEATS[0]) / 8, P1 = (BEATS[NB - 1] - BEATS[NB - 9]) / 8;
  MV.beatTime = i => (i < 0 ? BEATS[0] + i * P0 : i >= NB ? BEATS[NB - 1] + (i - NB + 1) * P1 : BEATS[i]);
  MV.barTime = n => MV.beatTime(n * 4);
  // continuous beat position: integer part = beat index, fractional = phase
  MV.beatPos = t => {
    if (t < BEATS[0]) return (t - BEATS[0]) / P0;
    if (t >= BEATS[NB - 1]) return NB - 1 + (t - BEATS[NB - 1]) / P1;
    let lo = 0, hi = NB - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (BEATS[m] <= t) lo = m; else hi = m; }
    return lo + (t - BEATS[lo]) / (BEATS[hi] - BEATS[lo]);
  };
  MV.snapBeat = t => MV.beatTime(Math.round(MV.beatPos(t)));

  // audio envelopes, 0..1
  const E = D.env;
  MV.env = (name, t) => {
    const a = E[name], x = t * E.fps, i = Math.floor(x), f = x - i;
    if (i < 0 || i >= a.length - 1) return 0;
    return (a[i] * (1 - f) + a[i + 1] * f) / 99;
  };
  // a decaying "hit" from the kick envelope, smoothed over a few frames
  MV.kick = t => {
    let m = 0;
    for (let k = 0; k < 5; k++) m = Math.max(m, MV.env('kick', t - k / 30) * Math.exp(-k * 0.55));
    return m;
  };

  // ------------------------------------------------------------------ lyrics
  MV.lyrics = D.lyrics;
  MV.wordAt = t => {
    for (const L of D.lyrics) {
      if (t < L.s - 0.05 || t > L.e + 0.1) continue;
      for (let i = 0; i < L.w.length; i++) {
        const ws = L.w[i][0], we = i + 1 < L.w.length ? L.w[i + 1][0] : L.e;
        if (t >= ws && t < we) return { line: L, i, k: (t - ws) / Math.max(0.05, we - ws), dur: we - ws };
      }
    }
    return null;
  };
  // singing mouth opening 0..1
  MV.sing = t => {
    const w = MV.wordAt(t);
    if (!w) return 0;
    const syl = Math.max(1, Math.round(w.dur / 0.16));
    const k = w.k * syl, f = k - Math.floor(k);
    const open = Math.sin(Math.PI * Math.min(1, f * 1.15));
    return U.c01(0.35 + 0.65 * open) * (0.55 + 0.45 * MV.env('loud', t)) * U.c01((1 - w.k) * 8 + 0.3);
  };

  // ------------------------------------------------------------------ renderer + post
  MV.initRenderer = function (canvas, opts) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.capture });
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 1);
    MV.renderer = renderer;

    const gl = renderer.getContext();
    const half = renderer.capabilities.isWebGL2 || !!gl.getExtension('OES_texture_half_float');
    const rtType = half && (renderer.capabilities.isWebGL2 ? gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float') : gl.getExtension('EXT_color_buffer_half_float')) ? THREE.HalfFloatType : THREE.UnsignedByteType;
    MV.rtType = rtType;

    const rt = new THREE.WebGLRenderTarget(4, 4, { type: rtType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const composer = new THREE.EffectComposer(renderer, rt);
    MV.composer = composer;
    MV.popRT = new THREE.WebGLRenderTarget(4, 4, { type: rtType, format: THREE.RGBAFormat });

    MV.post = {
      sat: { value: 0 }, exposure: { value: 1 }, vignette: { value: 0.35 }, grain: { value: 0.028 },
      ca: { value: 0 }, tiltY: { value: 0.5 }, tilt: { value: 0.0 }, whip: { value: new THREE.Vector2() },
      fade: { value: 1 }, flash: { value: 0 }, frame: { value: new THREE.Vector4() }, time: { value: 0 },
      tint: { value: new THREE.Vector3(1, 1, 1) }, lift: { value: new THREE.Vector3(0, 0, 0) },
      res: { value: new THREE.Vector2(1, 1) }, tPop: { value: MV.popRT.texture }, popOn: { value: 1 },
      border: { value: new THREE.Vector3(0.012, 0.011, 0.014) }, glitch: { value: 0 },
    };
    const P = MV.post;
    const finalShader = {
      uniforms: Object.assign({ tDiffuse: { value: null } }, P),
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: `
        uniform sampler2D tDiffuse, tPop; uniform vec2 res, whip; uniform vec4 frame;
        uniform float sat, exposure, vignette, grain, ca, tiltY, tilt, fade, flash, time, popOn, glitch;
        uniform vec3 tint, lift, border; varying vec2 vUv;
        vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
        float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
        vec3 tap(vec2 uv){
          vec2 d = (uv-0.5); float r = dot(d,d);
          vec2 o = d * ca * (0.6 + r);
          return vec3(texture2D(tDiffuse, uv + o).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - o).b);
        }
        void main(){
          vec2 uv = vUv;
          if (glitch > 0.0) { float band = floor(uv.y*24.0 + time*9.0); uv.x += (h(vec2(band, floor(time*30.0)))-0.5)*0.06*glitch*step(0.7, h(vec2(band*1.3, floor(time*12.0)))); }
          vec3 c = tap(uv);
          // tilt-shift: soften away from the focus band
          float b = tilt * smoothstep(0.08, 0.5, abs(uv.y - tiltY));
          if (b > 0.001) {
            vec2 px = b * 6.0 / res; vec3 acc = c;
            acc += texture2D(tDiffuse, uv + vec2( px.x, 0.0)).rgb + texture2D(tDiffuse, uv + vec2(-px.x, 0.0)).rgb;
            acc += texture2D(tDiffuse, uv + vec2(0.0,  px.y)).rgb + texture2D(tDiffuse, uv + vec2(0.0, -px.y)).rgb;
            acc += texture2D(tDiffuse, uv + px*0.7).rgb + texture2D(tDiffuse, uv - px*0.7).rgb;
            acc += texture2D(tDiffuse, uv + vec2(px.x,-px.y)*0.7).rgb + texture2D(tDiffuse, uv + vec2(-px.x,px.y)*0.7).rgb;
            c = acc / 9.0;
          }
          // whip-pan motion blur
          if (dot(whip, whip) > 1e-6) {
            vec3 acc = vec3(0.0);
            for (int i = 0; i < 12; i++) { float k = float(i)/11.0 - 0.5; acc += texture2D(tDiffuse, uv + whip*k).rgb; }
            c = mix(c, acc/12.0, clamp(length(whip)*18.0, 0.0, 1.0));
          }
          // frame: the scene lives inside a border; pop-out objects break over it
          vec2 p = uv * res;
          bool inside = p.x > frame.x && p.y > frame.w && p.x < res.x - frame.z && p.y < res.y - frame.y;
          if (!inside) {
            c = border;
            if (popOn > 0.5) { vec4 pp = texture2D(tPop, vUv); c = mix(c, pp.rgb, pp.a); }
          }
          c *= exposure * tint;
          c = aces(c);
          c = pow(c, vec3(1.0/2.2));
          float l = dot(c, vec3(0.2126,0.7152,0.0722));
          c = mix(vec3(l), c, sat);
          c = c + lift * (1.0 - c);
          vec2 q = vUv - 0.5; c *= 1.0 - vignette * smoothstep(0.25, 0.85, length(q*vec2(res.x/res.y,1.0)) * 0.9);
          c += (h(vUv*res + time*61.0) - 0.5) * grain;
          c = mix(c, vec3(1.0), flash);
          c *= 1.0 - fade;
          gl_FragColor = vec4(c, 1.0);
        }`,
    };
    MV.renderPass = new THREE.RenderPass(null, null);
    composer.addPass(MV.renderPass);
    MV.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.45, 2.0);
    composer.addPass(MV.bloom);
    // A ShaderMaterial (not a shader object) keeps these uniforms shared instead of cloned.
    MV.finalPass = new THREE.ShaderPass(new THREE.ShaderMaterial(finalShader));
    composer.addPass(MV.finalPass);
    return renderer;
  };

  MV.resize = function (w, h, dpr) {
    const r = MV.renderer;
    r.setPixelRatio(dpr);
    r.setSize(w, h, false);
    MV.composer.setPixelRatio(dpr);
    MV.composer.setSize(w, h);
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    MV.popRT.setSize(W, H);
    MV.post.res.value.set(W, H);
    const m = Math.round(Math.min(W, H) * 0.028);
    MV.post.frame.value.set(m, m, m, m);
    MV.bloom.setSize(W / 2, H / 2);
  };
})();
