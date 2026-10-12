/* TikTok Famous: the story (choreography, camera, lighting and cues), every value a function of song time */
(function () {
  const MV = window.MV, U = MV.U, TAU = U.TAU, DEG = U.deg;
  const S = (MV.story = {});
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const B = n => MV.barTime(n);
  const PY = () => MV.world.PAPER_Y;

  // ---------------------------------------------------------------- places
  const GIRL_LIE = V3(-3.2, 0, 6.5), DOG_LIE = V3(5.6, 0, 4.6), MARK = V3(0, 0, 2);

  // ---------------------------------------------------------------- girl choreography [time, move, opts]
  const GM = [
    [0, 'lie'], [19.0, 'stretch'], [19.86, 'phoneLook'], [24.4, 'facepalm'], [25.6, 'slump'],
    [26.4, 'walk'], [27.6, 'forcedSmile'], [29.46, 'selfie'], [31.0, 'phoneLook'], [32.28, 'phoneLook'],
    [34.2, 'sitPhone'], [36.18, 'refresh'], [37.9, 'selfie'], [40.04, 'point'], [41.96, 'freeze', { blend: 0.12 }],
    [44.96, 'jumpSpin', { blend: 0.1 }], [46.0, 'hype'], [48.58, 'surf'], [51.3, 'jumpSpin'], [52.56, 'hype'],
    [56.64, 'phoneEar'], [59.92, 'sway'], [62.03, 'shrug'], [63.92, 'hype'], [66.0, 'phoneLook'], [67.7, 'hype'],
    [71.34, 'phoneLook'], [75.98, 'swipe'], [82.8, 'duo'], [86.59, 'jumpSpin'], [87.6, 'duo'], [88.48, 'heartHands'], [90.0, 'duo'],
    [91.0, 'phoneLook'], [92.2, 'sway'], [92.98, 'pose'], [94.88, 'phoneLook'], [95.76, 'oneMore'], [96.6, 'phoneLook'], [98.04, 'shrug'],
    [99.04, 'extra'], [101.04, 'pose', { glasses: 1 }], [102.6, 'sway'], [104.8, 'hype'], [106.68, 'selfie'], [108.6, 'point'], [112.0, 'freeze', { blend: 0.12 }],
    [114.88, 'jumpSpin', { blend: 0.1 }], [115.9, 'hype'], [118.74, 'surf'], [121.3, 'jumpSpin'], [122.5, 'hype'], [126.52, 'phoneEar'],
    [129.88, 'sway'], [131.84, 'shrug'], [133.75, 'hype'], [135.9, 'phoneLook'], [137.51, 'hype'], [141.1, 'phoneLook'], [145.36, 'swipe'],
    [151.6, 'sway'], [156.0, 'sitPhone'], [161.42, 'cryPhone'], [172.6, 'cry'], [173.6, 'lapDog'], [175.38, 'lookUp'],
    [179.58, 'catchPhone'], [181.6, 'phoneLook'], [183.5, 'throwPhone'], [185.12, 'rest'], [185.7, 'catchPhone'], [187.12, 'lookUp', { blend: 0.6 }],
    [189.2, 'catchPhone'], [190.9, 'rest'], [191.97, 'throwBall'], [193.2, 'duo'], [195.62, 'surf'], [198.0, 'duo'],
    [203.16, 'phoneEar', { happy: 1 }], [207.0, 'hype'], [211.24, 'duo'], [213.07, 'heartHands'], [215.18, 'phoneLook'], [217.84, 'hugDog'],
    [220.05, 'duo'], [222.28, 'swipe'], [226.44, 'wave'], [230.58, 'duo'], [233.8, 'hype'], [236.72, 'heartHands', { blend: 0.12 }],
    [237.32, 'sway'], [240.4, 'rest'], [241.6, 'lie', { blend: 0.8 }],
  ];
  // girl position on the paper [time, x, z, yawDeg]
  const GP = [
    [0, -3.2, 6.5, 0], [26.4, -3.2, 6.5, 0], [27.6, 0, 2, 40], [34.2, 0, 2, 20], [37.9, 0, 2, 0], [44.9, 0, 2, 0],
    [56.6, 0, 2, 0], [57.2, 0, 2, -30], [59.9, 0, 2, 0], [71.3, 0, 2, 0], [72.5, 0, 2, -35], [75.9, 0, 2, 0],
    [82.8, -1.2, 2, 15], [90.0, -1.2, 2, 15], [91.0, 0, 2, 0], [94.8, 0, 2, -20], [96.5, 0, 2, 0],
    [126.5, 0, 2, -30], [129.8, 0, 2, 0], [141.1, 0, 2, 0], [142.3, 0, 2, 35], [145.3, 0, 2, 0],
    [161.4, 0, 2, 10], [172.6, 0, 2, 10], [181.7, 0, 2, 0], [183.3, 0, 2, 40], [185.0, 0, 2, 40], [187.1, 0, 2, 0],
    [190.9, 0, 2, 25], [191.9, -1.2, 2, 30], [193.2, -1.2, 2, 15], [215.2, -1.2, 2, 15], [217.8, -0.6, 2.4, 90], [220.0, -1.2, 2, 15],
    [237.3, -1.2, 2, 0], [240.4, -3.2, 6.5, 0],
  ];
  // lying (1) to standing (0); pivots on the feet
  const G_LIEKEYS = [[0, 1], [19.0, 1], [19.8, 0], [241.4, 0], [242.4, 1]];

  // ---------------------------------------------------------------- dog choreography
  const DM = [
    [0, 'rest'], [19.4, 'wag'], [22.0, 'sit'], [26.4, 'run'], [27.6, 'sit'], [31.0, 'wag'], [34.2, 'sit'], [38.0, 'hop'],
    [41.96, 'beg', { blend: 0.1 }], [44.96, 'hop'], [48.58, 'run'], [52.56, 'hop'], [56.6, 'sit'], [59.9, 'wag'], [63.9, 'hop'], [67.7, 'beg'],
    [71.0, 'run'], [72.6, 'nudge'], [75.98, 'hop'], [82.8, 'dance'], [86.59, 'spin'], [87.6, 'dance'], [91.0, 'sit'], [99.04, 'hop'], [101.0, 'sit'],
    [104.8, 'hop'], [108.6, 'beg'], [112.0, 'beg', { blend: 0.1 }], [114.88, 'hop'], [118.74, 'run'], [122.5, 'hop'], [126.5, 'sit'], [129.9, 'wag'],
    [133.75, 'beg'], [140.6, 'run'], [141.8, 'nudge'], [143.6, 'sad'], [145.36, 'sad'], [151.6, 'sad'], [161.4, 'sad'], [170.6, 'run'], [172.4, 'lapHead'],
    [175.38, 'sit'], [181.6, 'sad'], [189.6, 'run'], [190.6, 'wag'], [191.97, 'run'], [192.45, 'catch'], [193.4, 'dance'], [195.62, 'hop'], [198.0, 'dance'],
    [203.1, 'sit'], [207.0, 'dance'], [213.0, 'beg'], [215.2, 'sit'], [217.6, 'wag'], [220.05, 'dance'], [226.4, 'beg'], [230.58, 'dance'], [233.8, 'hop'],
    [236.72, 'beg', { blend: 0.1 }], [237.32, 'wag'], [240.4, 'run'], [241.4, 'rest'],
  ];
  const DP = [
    [0, 5.6, 4.6, -90], [19.6, 5.6, 4.6, -90], [21.0, 5.6, 4.6, -60], [26.4, 5.6, 4.6, -60], [27.6, 3.9, 3.6, -20], [44.9, 3.9, 3.6, -20],
    [48.58, 3.9, 3.6, -20], [52.5, 3.9, 3.6, -20], [71.0, 3.9, 3.6, -20], [72.6, 1.9, 4.4, -110], [75.9, 3.9, 3.6, -20],
    [82.8, 3.2, 3.0, -20], [90.0, 3.2, 3.0, -20], [91.0, 3.9, 3.6, -20], [140.6, 3.9, 3.6, -20], [141.8, 1.9, 4.4, -110], [143.6, 4.8, 4.6, -60],
    [170.6, 4.8, 4.6, -60], [172.4, 3.7, 3.3, -100], [175.3, 3.7, 3.5, -100], [181.6, 4.6, 4.2, -70], [189.6, 4.6, 4.2, -70], [190.6, 1.9, 4.2, -100],
    [191.97, 1.9, 4.2, -100], [192.45, 4.5, 5.2, -40], [193.4, 2.6, 2.6, -15], [217.6, 2.6, 2.6, -15], [218.2, 2.9, 2.5, -90], [220.05, 2.6, 2.6, -15],
    [240.4, 5.6, 4.6, -90],
  ];
  const D_LIEKEYS = [[0, 1], [19.2, 1], [19.8, 0], [241.0, 0], [242.2, 1]];
  // flat drawing (0) to full 3D (1)
  const INFLATE = [[0, 0], [18.42, 0], [18.95, 1], [241.9, 1], [243.0, 0]];

  // ---------------------------------------------------------------- look: grade + lights [time, {...}]
  const LOOK = [
    [0, { sat: 0, exp: 0.85, ring: 0, key: 0.7, hemi: 0.22, rim: 0, tilt: 0.75, ink: 0.06, vig: 0.5, warm: 0, cool: 0.35, bok: 0.25, phone: 0 }],
    [18.3, { sat: 0, exp: 0.9, ring: 0, key: 0.9, hemi: 0.28, rim: 0, tilt: 0.6, ink: 0.06, vig: 0.5, warm: 0, cool: 0.35, bok: 0.3, phone: 0.4 }],
    [19.2, { ink: 0.035 }],
    [26.25, { sat: 0.05, exp: 0.9, ring: 0, key: 0.8, hemi: 0.3, cool: 0.3, bok: 0.35, phone: 0.4 }],
    [26.4, { sat: 0.32, exp: 1.08, ring: 1, key: 0.55, hemi: 0.42, cool: 0.05, warm: 0.15, tilt: 0.35, bok: 0.55, phone: 0.2 }],
    [29.4, { sat: 0.32 }], [29.7, { sat: 0.75 }], [31.6, { sat: 0.75 }], [32.2, { sat: 0.32 }],
    [41.9, { sat: 0.32, exp: 1.05, rim: 0, cool: 0.05 }], [42.1, { sat: 0.0, exp: 0.82, cool: 0.4, ring: 0.6 }], [44.8, { sat: 0.0, exp: 0.78, ring: 0.5 }],
    [44.96, { sat: 1, exp: 1.0, ring: 1, rim: 1, warm: 0.2, cool: 0, tilt: 0.25, bok: 1, key: 0.5, hemi: 0.5, phone: 0 }],
    [56.5, { sat: 1, rim: 1, exp: 1.0 }], [57.0, { sat: 0.55, rim: 0.3, exp: 1.0, cool: 0.2 }], [59.8, { sat: 0.55, rim: 0.3 }], [60.3, { sat: 1, rim: 1, exp: 1.0, cool: 0 }],
    [71.2, { sat: 1, rim: 1 }], [71.8, { sat: 0.6, rim: 0.4, cool: 0.15 }], [75.8, { sat: 0.6, rim: 0.4 }], [76.0, { sat: 1, rim: 1, cool: 0 }],
    [90.3, { sat: 1, rim: 1, exp: 1.0 }], [91.0, { sat: 0.85, rim: 0.5, exp: 1.05 }],
    [101.0, { sat: 0.85, cool: 0 }], [101.6, { sat: 0.35, cool: 0.4, rim: 0.2 }], [104.6, { sat: 0.35, cool: 0.4 }], [104.9, { sat: 1, cool: 0, rim: 1 }],
    [111.9, { sat: 1, exp: 1.0, rim: 1, ring: 1 }], [112.1, { sat: 0, exp: 0.8, cool: 0.4, ring: 0.5, rim: 0 }], [114.7, { sat: 0, exp: 0.78 }],
    [114.88, { sat: 1, exp: 1.0, ring: 1, rim: 1, warm: 0.25, cool: 0, bok: 1 }],
    [126.4, { sat: 1, rim: 1 }], [127.0, { sat: 0.55, rim: 0.3, cool: 0.2 }], [129.7, { sat: 0.55 }], [130.2, { sat: 1, rim: 1, cool: 0 }],
    [141.0, { sat: 1, rim: 1 }], [141.6, { sat: 0.55, rim: 0.3, cool: 0.2 }], [145.2, { sat: 0.55 }], [145.36, { sat: 1, rim: 1, cool: 0 }],
    [151.6, { sat: 1, exp: 1.0, ring: 1, rim: 1, bok: 1, hemi: 0.5, key: 0.5 }],
    [160.0, { sat: 0.35, exp: 0.85, ring: 0.6, rim: 0, bok: 0.35, hemi: 0.18, key: 0.45, cool: 0.45, warm: 0, phone: 0.6, tilt: 0.5 }],
    [160.3, { ring: 0 }],
    [161.4, { sat: 0.3, exp: 0.82, ring: 0, hemi: 0.14, key: 0.4, cool: 0.55, phone: 1, bok: 0.3 }],
    [172.6, { phone: 1, sat: 0.3 }], [174.0, { phone: 0.3, sat: 0.45, warm: 0.15, cool: 0.3, exp: 0.9 }],
    [175.38, { sat: 0.5, ring: 0.35, hemi: 0.25, exp: 0.95 }], [186.9, { sat: 0.45, ring: 0.35 }],
    [187.4, { sat: 0.0, ring: 0.12, exp: 0.78, ink: 0.06, cool: 0.5, hemi: 0.12, bok: 0.15 }], [190.6, { sat: 0.0, ink: 0.07 }],
    [191.97, { sat: 1, exp: 1.02, ring: 1, rim: 1, warm: 0.3, cool: 0, ink: 0.035, hemi: 0.55, key: 0.5, bok: 1, phone: 0, tilt: 0.25 }],
    [215.0, { sat: 1, rim: 1 }], [215.6, { sat: 0.7, rim: 0.4 }], [217.8, { sat: 0.7, rim: 0.4 }], [218.3, { sat: 1, rim: 1, warm: 0.4 }],
    [236.6, { sat: 1, exp: 1.2 }], [236.72, { sat: 1, exp: 1.35 }], [237.3, { sat: 1, exp: 1.15 }],
    [240.4, { sat: 0.9, ring: 1, rim: 0.6, ink: 0.035 }], [240.6, { ring: 0, rim: 0 }],
    [242.4, { sat: 0.25, exp: 0.95, hemi: 0.3, key: 0.8, cool: 0.25, warm: 0.05, ink: 0.06, tilt: 0.6, bok: 0.4 }],
    [246.8, { sat: 0.25 }],
  ];
  // fill in missing fields so every key is complete
  (function () { let prev = {}; for (const k of LOOK) { k[1] = Object.assign({}, prev, k[1]); prev = k[1]; } })();
  const lookAt = t => {
    let i = 0; while (i < LOOK.length - 1 && LOOK[i + 1][0] <= t) i++;
    const a = LOOK[i], b = LOOK[Math.min(i + 1, LOOK.length - 1)];
    const k = b[0] > a[0] ? U.c01((t - a[0]) / (b[0] - a[0])) : 0;
    const o = {}; for (const key in a[1]) o[key] = U.lerp(a[1][key], b[1][key] ?? a[1][key], k);
    return o;
  };

  // flashes, whips, glitches
  const FLASH = [[18.56, 0.25], [26.3, 0.55], [44.96, 0.85], [64.84, 0.35], [114.88, 0.85], [134.72, 0.35], [191.97, 0.9], [236.72, 0.5]];
  const SWIPES = [75.98, 76.72, 77.88, 78.62, 79.78, 80.58, 81.68, 145.36, 146.48, 147.66, 149.46, 150.28, 222.28, 223.36, 224.56, 225.3];
  const GLITCH = [[102.6, 103.0], [103.84, 104.3], [187.12, 187.35], [190.2, 190.45]];

  // ---------------------------------------------------------------- camera shots [t0, a, b?, opts?]
  const SH = [];
  const shot = (t, a, b, o) => SH.push(Object.assign({ t, a, b: Object.assign({}, a, b || {}) }, o || {}));
  shot(0, { tg: [-1, 0, 1.5], az: 0, el: 82, d: 54 }, { d: 44 });
  shot(2.9, { tg: 'drawGirl', az: -15, el: 62, d: 28 }, { az: 6, d: 24 });
  shot(7.88, { tg: 'pencil', az: 40, el: 22, d: 16 }, { az: 58, d: 13 });
  shot(11.3, { tg: [1, 0, 2.5], az: -50, el: 50, d: 34 }, { az: 30, el: 42, d: 29 });
  shot(16.47, { tg: 'drawGirlHead', az: 0, el: 82, d: 22 }, { d: 13 });
  shot(18.38, { tg: 'girl', az: -10, el: 30, d: 23 }, { az: 10, d: 19 });
  shot(20.3, { tg: 'head', az: 25, el: 4, d: 12 }, { az: 15, d: 11 });
  shot(22.19, { tg: 'phone', az: 145, el: 58, d: 9.5 }, { az: 150, d: 8.5 });
  shot(24.1, { tg: 'head', az: -5, el: 8, d: 10 }, { d: 9 });
  shot(26.3, { tg: 'ringMid', az: -35, el: 14, d: 40 }, { az: -25, d: 35 });
  shot(27.87, { tg: 'head', pov: 'ring' }, null, { h: 0.2 });
  shot(29.79, { tg: 'head', az: 30, el: 6, d: 9 }, { az: 20, d: 8 }, { h: 0.7 });
  shot(31.7, { tg: 'girl', az: -50, el: 20, d: 18 }, { az: -65 });
  shot(34.2, { tg: 'girl', az: 15, el: 3, d: 13 }, { az: 5, d: 11 });
  shot(36.18, { tg: 'phone', az: 0, el: 66, d: 7 }, { d: 6 });
  shot(37.4, { tg: 'girl', az: 0, el: 12, d: 19 }, { d: 17 });
  shot(40.04, { tg: 'head', az: 0, el: 8, d: 16 }, { d: 8.5 }, { ease: 'in' });
  shot(41.96, { tg: 'girl', az: -20, el: 10, d: 11 }, { az: 120, el: 14, d: 10 }, { ease: 'lin' });
  shot(44.96, { tg: 'girl', az: -35, el: 26, d: 32 }, { az: 25, el: 18, d: 24 });
  shot(46.89, { tg: 'girl', az: 0, el: 8, d: 14 }, { d: 12 }, { punch: 1 });
  shot(48.58, { tg: 'girl', az: 60, el: 25, d: 22 }, { az: 140 });
  shot(50.68, { tg: 'girl', az: -60, el: 10, d: 15 }, { az: -30 }, { punch: 1 });
  shot(52.56, { tg: [0, 7, 0], az: 0, el: 16, d: 24 }, { el: 22, d: 52 });
  shot(56.35, { tg: 'head', az: 35, el: 4, d: 11 }, { az: 45, d: 10 });
  shot(59.92, { tg: [0, 9, -22], az: 14, el: 3, d: 31 }, { az: 10, d: 29 });
  shot(62.03, { tg: 'head', az: -20, el: 10, d: 11 });
  shot(63.92, { tg: 'girl', az: 15, el: 30, d: 26 }, { d: 20 }, { punch: 1 });
  shot(65.81, { tg: 'head', az: 30, el: 6, d: 9 });
  shot(67.7, { tg: 'girl', az: -40, el: 20, d: 20 }, { az: -10 }, { punch: 1 });
  shot(69.58, { tg: 'girl', az: 40, el: 35, d: 22 }, { az: 70 }, { punch: 1 });
  shot(71.48, { tg: 'duo', az: -110, el: 8, d: 16 }, { az: -90 });
  shot(73.36, { tg: 'head', az: 10, el: 2, d: 11 });
  const swA = [{ az: -60, el: 15, d: 16 }, { az: 60, el: 25, d: 14 }, { az: 0, el: 40, d: 20 }, { az: 150, el: 12, d: 15 }, { az: -30, el: 5, d: 11 }, { az: 90, el: 30, d: 18 }, { az: 0, el: 12, d: 22 }];
  [75.98, 76.72, 77.88, 78.62, 79.78, 80.58, 81.68].forEach((t, i) => shot(t, Object.assign({ tg: 'girl' }, swA[i]), { az: swA[i].az + 12 }, { punch: 1 }));
  shot(82.8, { tg: 'duo', az: 0, el: 18, d: 22 }, { az: 360, el: 26, d: 20 }, { ease: 'lin', punch: 1 });
  shot(91.0, { tg: 'girl', az: 10, el: 12, d: 20 }, { d: 17 });
  shot(92.98, { tg: 'head', az: -25, el: 10, d: 11 });
  shot(94.88, { tg: 'girl', az: -50, el: 12, d: 18 }, { az: -40 });
  shot(96.6, { tg: 'head', az: 20, el: 8, d: 10 });
  shot(99.04, { tg: 'girl', az: -30, el: 14, d: 15 }, null, { punch: 1 });
  shot(99.78, { tg: 'girl', az: 30, el: 20, d: 13 }, null, { punch: 1 });
  shot(100.66, { tg: 'head', az: 0, el: 5, d: 11 }, null, { punch: 1 });
  shot(101.04, { tg: 'girl', az: 0, el: 20, d: 20 }, { tg: [0, 12, 0], el: 30, d: 28 });
  shot(103.57, { tg: 'head', az: -15, el: 10, d: 10 });
  shot(104.8, { tg: 'girl', az: 30, el: 30, d: 20 }, { az: 10 }, { punch: 1 });
  shot(106.68, { tg: 'girl', az: 0, el: 12, d: 19 });
  shot(108.6, { tg: 'head', az: 0, el: 8, d: 16 }, { d: 8.5 }, { ease: 'in' });
  shot(112.0, { tg: 'girl', az: 160, el: 6, d: 11 }, { az: 270, el: 20, d: 10 }, { ease: 'lin' });
  shot(114.88, { tg: 'girl', az: 0, el: 72, d: 34 }, { el: 28, d: 24 });
  shot(116.77, { tg: 'girl', az: -45, el: 6, d: 13 }, { az: -30 }, { punch: 1 });
  shot(118.66, { tg: 'girl', az: -90, el: 20, d: 20 }, { az: 0 });
  shot(120.55, { tg: 'girl', az: 30, el: 12, d: 14 }, null, { punch: 1 });
  shot(122.43, { tg: [0, 3, 0], az: 0, el: 62, d: 40 }, { d: 50, roll: 25 });
  shot(126.21, { tg: 'head', az: -35, el: 4, d: 11 });
  shot(129.88, { tg: [0, 9, -22], az: -14, el: 3, d: 31 }, { az: -8, d: 29 });
  shot(131.86, { tg: 'head', az: 20, el: 10, d: 11 });
  shot(133.75, { tg: 'girl', az: -20, el: 35, d: 28 }, { d: 22 }, { punch: 1 });
  shot(135.63, { tg: 'head', az: -30, el: 6, d: 9 });
  shot(137.51, { tg: 'girl', az: 50, el: 18, d: 18 }, { az: 20 }, { punch: 1 });
  shot(139.4, { tg: 'girl', az: -50, el: 24, d: 20 }, { az: -20 }, { punch: 1 });
  shot(141.29, { tg: 'duo', az: 110, el: 8, d: 15 }, { az: 90 });
  shot(143.16, { tg: 'head', az: 0, el: 5, d: 10 });
  [145.36, 146.48, 147.66, 149.46, 150.28].forEach((t, i) => shot(t, Object.assign({ tg: 'girl' }, swA[(i + 2) % 7]), { az: swA[(i + 2) % 7].az - 12 }, { punch: 1 }));
  shot(151.4, { tg: 'girl', az: 0, el: 25, d: 24 }, { el: 36, d: 44 });
  shot(161.42, { tg: 'head', az: 15, el: 2, d: 14 }, { d: 10 });
  shot(164.58, { tg: 'head', az: 30, el: 3, d: 11 }, { az: 22, d: 10 });
  shot(167.92, { tg: 'girl', az: -30, el: 10, d: 14 }, { tg: [-1, 10, 2], el: 22 });
  shot(170.72, { tg: 'girl', az: 30, el: 45, d: 16 }, { az: 38 });
  shot(172.8, { tg: 'duo', az: -35, el: 8, d: 13 }, { d: 11.5 });
  shot(175.38, { tg: [0, 8, -6], az: 0, el: 15, d: 34 }, { d: 39 });
  shot(179.58, { tg: 'girl', az: 0, el: 20, d: 14 }, { az: 360, el: 14, d: 13 }, { ease: 'lin' });
  shot(181.72, { tg: [3.5, 3, 1.5], az: 0, el: 12, d: 22 }, { d: 20 });
  shot(183.34, { tg: 'girl', az: 30, el: 15, d: 18 }, { az: 40 });
  shot(185.12, { tg: 'girl', az: -30, el: 15, d: 16 }, { az: -20 });
  shot(187.12, { tg: 'head', az: 0, el: 3, d: 17 }, { d: 10 }, { ease: 'lin' });
  shot(189.2, { tg: 'head', az: -35, el: 4, d: 11 }, { az: -25, d: 10 });
  shot(191.97, { tg: 'duo', az: -25, el: 28, d: 30 }, { az: 20, el: 20, d: 22 });
  shot(193.87, { tg: 'dog', az: 60, el: 10, d: 14 }, null, { punch: 1 });
  shot(195.74, { tg: 'duo', az: 90, el: 22, d: 20 }, { az: 180 });
  shot(197.61, { tg: 'duo', az: -40, el: 8, d: 15 }, null, { punch: 1 });
  shot(199.51, { tg: [0, 7, 0], az: 0, el: 18, d: 28 }, { d: 50 });
  shot(203.16, { tg: 'phone', az: 20, el: 40, d: 9 });
  shot(205.11, { tg: 'head', az: -20, el: 8, d: 10 });
  shot(207.0, { tg: 'duo', az: 0, el: 12, d: 20 }, { az: 25 }, { punch: 1 });
  shot(208.86, { tg: 'duo', az: -50, el: 25, d: 22 }, null, { punch: 1 });
  shot(211.24, { tg: 'duo', az: 20, el: 30, d: 24 }, { d: 20 }, { punch: 1 });
  shot(213.07, { tg: 'dog', az: -20, el: 10, d: 11 });
  shot(215.18, { tg: 'head', az: 15, el: 8, d: 11 });
  shot(217.84, { tg: 'duo', az: -15, el: 12, d: 11 }, { az: 15, d: 10 });
  shot(220.05, { tg: 'duo', az: 0, el: 40, d: 26 }, { az: 40 }, { punch: 1 });
  [222.28, 223.36, 224.56, 225.3].forEach((t, i) => shot(t, Object.assign({ tg: 'duo' }, swA[(i + 4) % 7]), { az: swA[(i + 4) % 7].az + 10 }, { punch: 1 }));
  shot(226.44, { tg: [-0.6, 5, 2], az: 0, el: 10, d: 21 }, { d: 20 });
  shot(230.58, { tg: 'duo', az: -30, el: 22, d: 20 }, { az: 30 }, { punch: 1 });
  shot(233.8, { tg: 'duo', az: 0, el: 6, d: 16 }, { az: -20, el: 15 }, { punch: 1 });
  shot(236.72, { tg: 'duo', az: 20, el: 12, d: 13 });
  shot(237.32, { tg: 'duo', az: -30, el: 30, d: 22 }, { az: 30, el: 45, d: 30 });
  shot(240.53, { tg: [-1, 0, 2.5], az: 0, el: 76, d: 30 }, { el: 86, d: 40 });
  SH.sort((a, b) => a.t - b.t);

  // ---------------------------------------------------------------- helpers
  function pathAt(P, t) {
    if (!P.cum) { P.cum = [0]; for (let j = 1; j < P.length; j++) P.cum.push(P.cum[j - 1] + Math.hypot(P[j][1] - P[j - 1][1], P[j][2] - P[j - 1][2])); }
    let i = 0; while (i < P.length - 1 && P[i + 1][0] <= t) i++;
    const a = P[i], b = P[Math.min(i + 1, P.length - 1)];
    const k = b[0] > a[0] ? U.inOut(U.c01((t - a[0]) / (b[0] - a[0]))) : 0;
    const seg = Math.hypot(b[1] - a[1], b[2] - a[2]);
    return { x: U.lerp(a[1], b[1], k), z: U.lerp(a[2], b[2], k), yaw: U.lerp(a[3], b[3], k) * DEG, moving: k > 0 && k < 1 && seg > 0.05, travel: P.cum[i] + seg * k };
  }
  function keyAt(K, t, ease = U.inOut) {
    let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++;
    const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
    const k = b[0] > a[0] ? ease(U.c01((t - a[0]) / (b[0] - a[0]))) : 0;
    return U.lerp(a[1], b[1], k);
  }
  function moveCtx(t, t0, t1, opts) {
    const bp = MV.beatPos(t), bi = Math.floor(bp);
    return Object.assign({ t, bp, ph: bp - bi, bb: ((bi % 4) + 4) % 4, s: U.c01((t - t0) / Math.max(0.01, t1 - t0)), tl: t - t0 }, opts || {});
  }
  function evalMoves(list, lib, full, blend, t) {
    let i = 0; while (i < list.length - 1 && list[i + 1][0] <= t) i++;
    const seg = list[i], t1 = i + 1 < list.length ? list[i + 1][0] : t + 10;
    let pose = full(lib[seg[1]](moveCtx(t, seg[0], t1, seg[2])));
    const bw = (seg[2] && seg[2].blend) || 0.3;
    if (i > 0 && t - seg[0] < bw) {
      const p = list[i - 1];
      const prev = full(lib[p[1]](moveCtx(t, p[0], seg[0], p[2])));
      pose = blend(prev, pose, U.smooth((t - seg[0]) / bw));
    }
    return { pose, name: seg[1] };
  }

  // ---------------------------------------------------------------- build
  S.build = function (scene, girl, dog) {
    S.scene = scene; S.girl = girl; S.dog = dog;
    scene.add(girl.root, dog.root);
    S.head = V3(); S.girlPos = V3(); S.dogPos = V3(); S.phonePos = V3(); S.dogHead = V3();
    S.popGirl = null;
    const blobTex = MV.radialTex('rgba(0,0,0,0.85)', 'rgba(0,0,0,0.35)', 128);
    const blob = (w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.5 })); m.rotation.x = -Math.PI / 2; m.renderOrder = 2; scene.add(m); return m; };
    S.blobG = blob(4.2, 3.4); S.blobD = blob(3.2, 5.6);

    // heart surfboard
    const bm = new THREE.MeshPhysicalMaterial({ color: 0xff2d6f, roughness: 0.2, clearcoat: 1, emissive: 0xff2d6f, emissiveIntensity: 0.35 });
    S.board = new THREE.Mesh(MV.fx.heartGeo(2.3, 0.4), bm);
    S.board.castShadow = true; S.board.visible = false; MV.outlined(S.board); scene.add(S.board);
    // flying phone (delete / re-download)
    S.flyPhone = MV.makePhone(0.9, 1.85, 0.12); S.flyPhone.visible = false; scene.add(S.flyPhone);
    // soul ghost
    const gm = new THREE.MeshBasicMaterial({ color: 0x7fe9ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    MV.chars.applyGirl(girl, MV.chars.full({ lsz: 1.3, rsz: 1.3, le: 0.2, re: 0.2, hx: -0.3, eyes: 0.2 }), 0);
    girl.root.updateMatrixWorld(true);
    S.ghost = girl.root.clone(true);
    S.ghost.traverse(o => { if (o.isMesh) { if (o.userData.outline) o.visible = false; else o.material = gm; o.castShadow = false; } });
    S.ghost.visible = false; scene.add(S.ghost); S.ghostMat = gm;

    // drawing strokes in world space
    S.strokes = [];
    for (const st of MV.chars.girlDrawing()) S.strokes.push(Object.assign({}, st, { who: 'girl', pts: st.pts.map(p => [GIRL_LIE.x + p[0], GIRL_LIE.z - p[1]]) }));
    for (const st of MV.chars.dogDrawing()) S.strokes.push(Object.assign({}, st, { who: 'dog', pts: st.pts.map(p => [DOG_LIE.x - p[0], DOG_LIE.z - p[1]]) }));
    let total = 0;
    S.strokes.forEach(s => { s.cum = [0]; for (let i = 1; i < s.pts.length; i++) s.cum.push(s.cum[i - 1] + Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1])); s.len = s.cum[s.cum.length - 1]; total += s.len; });
    // schedule: girl 2.98 to 11.3, dog 11.3 to 16.4, a short lift between strokes
    const sched = (who, t0, t1) => {
      const list = S.strokes.filter(s => s.who === who), gap = 0.07, L = list.reduce((a, s) => a + s.len, 0);
      const speed = L / (t1 - t0 - gap * list.length);
      let tt = t0; list.forEach(s => { s.t0 = tt; s.t1 = tt + s.len / speed; tt = s.t1 + gap; });
    };
    sched('girl', 2.98, 11.25); sched('dog', 11.4, 16.4);
    S.taps = [[0.72, -9, -7], [1.32, -7.8, -7.4], [2.16, -6.6, -7], [2.42, -5.4, -7.4]];
    S.inkState = { t: -1 };

    // title written by the pencil at the end
    S.title = { t0: 242.6, t1: 245.6, text: 'TikTok Famous', x: 1.0, z: 11.2, size: 2.6 };

    buildCues();
  };

  // ---------------------------------------------------------------- cue definitions for fx
  function buildCues() {
    const F = MV.fx;
    const headUp = (dy, dx = 0, dz = 0) => () => V3(S.head.x + dx, S.head.y + dy, S.head.z + dz);
    // cards
    F.card({ t0: 22.56, t1: 26.2, text: '47 ♥', sub: 'likes', style: 'note', w: 4.2, pos: headUp(3.2, 0.8) });
    F.card({ t0: 30.5, t1: 32.25, text: t => '0:' + String(Math.max(0, Math.ceil(15 - (t - 30.5) * 6))).padStart(2, '0'), style: 'pill', w: 3.6, aspect: 2.4, pos: headUp(3.0, -1.6), accent: '#2fd0ff' });
    F.card({ t0: 32.28, t1: 34.3, text: 'Phones away, please!', style: 'bubble', w: 7.5, aspect: 3, pos: headUp(2.4, -6.5, -2) });
    F.card({ t0: 57.2, t1: 59.8, text: 'No new messages', style: 'pill', w: 5.2, aspect: 3.4, pos: headUp(2.8, 1.2), accent: '#9aa0aa' });
    F.card({ t0: 62.08, t1: 64.3, text: 'Contacts: 0', style: 'pill', w: 4.4, aspect: 3, pos: headUp(3.0, -1.4) });
    F.card({ t0: 64.84, t1: 67.6, text: '1,000,000', style: 'neon', w: 14, aspect: 3.6, pos: () => V3(0, 15, -6), bob: 0.3 });
    F.card({ t0: 66.5, t1: 67.9, text: 'typing…', style: 'bubble', w: 3.4, aspect: 2.2, pos: headUp(2.6, 1.6), bg: '#e9e9ef' });
    F.card({ t0: 91.0, t1: 92.6, text: 'Group chat  ·  …', style: 'bubble', w: 4.8, aspect: 3, pos: headUp(3.2, -2), bg: '#d9dbe2', fg: '#6b6e78' });
    const loud = ['QUEEN!!', 'obsessed', 'iconic', 'teach me!!', 'ur so famous', 'omg hi', 'LEGEND', 'more pls'];
    loud.forEach((s, i) => F.card({ t0: 92.1 + i * 0.32, t1: 95.0 + i * 0.1, text: s, style: 'bubble', w: 3.2, aspect: 2.6, bg: ['#ff4f9a', '#2fd0ff', '#ffd23a', '#9a6bff'][i % 4], fg: '#ffffff', pos: headUp(1.5 + (i % 3) * 1.6, (i % 2 ? 1 : -1) * (3.0 + (i % 4) * 0.8), -1 + (i % 3)) }));
    F.card({ t0: 94.88, t1: 96.5, text: 'DINNER!!', style: 'bubble', w: 6, aspect: 2.4, pos: headUp(2.2, -7, -1), bg: '#fff4d6' });
    F.card({ t0: 96.6, t1: 99.0, text: 'Screen time  9h 04m', style: 'pill', w: 6.4, aspect: 3.6, pos: headUp(3.0, 1.0), accent: '#ff3b3b' });
    F.card({ t0: 134.72, t1: 137.6, text: '10,000,000', style: 'neon', w: 15, aspect: 3.6, pos: () => V3(0, 15, -6), bob: 0.3, accent: '#2fd0ff' });
    F.card({ t0: 128.2, t1: 129.8, text: 'No new messages', style: 'pill', w: 5.2, aspect: 3.4, pos: headUp(2.8, 1.2), accent: '#9aa0aa' });
    F.card({ t0: 132.3, t1: 134.2, text: 'Contacts: 0', style: 'pill', w: 4.4, aspect: 3, pos: headUp(3.0, -1.4) });
    F.card({ t0: 136.3, t1: 137.7, text: 'typing…', style: 'bubble', w: 3.4, aspect: 2.2, pos: headUp(2.6, 1.6), bg: '#e9e9ef' });
    F.card({ t0: 161.42, t1: 164.4, text: '3:00 AM', style: 'note', w: 4.4, pos: headUp(3.4, -2.2) });
    F.card({ t0: 168.9, t1: 172.4, text: '“this is so real ♥”', style: 'bubble', w: 6, aspect: 3.4, pos: t => V3(S.head.x + 1.2, S.head.y + 2 + (t - 168.9) * 1.6, S.head.z) });
    ['next', 'lol', 'cute', 'scroll', 'next →', 'ok'].forEach((s, i) => F.card({ t0: 170.7 + i * 0.22, t1: 172.6 + i * 0.12, text: s, style: 'bubble', w: 2.6, aspect: 2.4, bg: '#e9e9ef', pos: t => V3(S.head.x + (i % 2 ? 2.4 : -2.6), S.head.y + (t - 170.7 - i * 0.22) * 9 - 2, S.head.z - 1 + i * 0.3) }));
    F.card({ t0: 175.5, t1: 181.5, text: t => (Math.round(U.lerp(300000, 41000, U.range(t, 175.5, 181.5)) / 100) * 100).toLocaleString('en-US') + '  ↓', style: 'pill', w: 6, aspect: 3.4, pos: () => V3(0, 13, -4), accent: '#ff3b3b' });
    F.card({ t0: 183.6, t1: 185.0, text: '1:45 AM', style: 'note', w: 3.8, pos: headUp(3.2, -2) });
    F.card({ t0: 185.2, t1: 187.0, text: '2:15 AM', style: 'note', w: 3.8, pos: headUp(3.2, 2) });
    F.card({ t0: 203.6, t1: 206.8, text: 'Mom ♥ calling', style: 'pill', w: 5.6, aspect: 3.4, pos: headUp(3.0, 1.2), accent: '#4dff9a' });
    F.card({ t0: 211.7, t1: 214.4, text: '1,000,000', style: 'neon', w: 13, aspect: 3.6, pos: () => V3(0, 15, -6), bob: 0.3 });
    F.card({ t0: 213.1, t1: 215.1, text: '1 best friend ♥', style: 'note', w: 4.6, pos: () => V3(S.dogPos.x, S.dogPos.y + 7, S.dogPos.z) });

    // icons: like, share, save, follow
    const fromPhone = () => S.phonePos.clone();
    [[38.16, 'like', -1], [38.7, 'share', 1], [39.24, 'save', -0.5], [39.64, 'plus', 0.6], [106.68, 'like', 1], [107.3, 'share', -1], [107.9, 'save', 0.5], [108.34, 'plus', -0.6]]
      .forEach(([t, kind, side]) => F.icon({ t, kind, side, from: fromPhone }));

    // particles
    const around = (r, y) => (tb, i) => { const a = U.hash(i * 1.7) * TAU; return V3(S.girlPos.x + Math.cos(a) * r, y + U.hash(i * 2.3) * 2, S.girlPos.z + Math.sin(a) * r); };
    const atHead = (tb, i) => S.head.clone();
    const atPhone = (tb, i) => S.phonePos.clone();
    F.emit({ kind: 'spark', t0: 29.46, t1: 31.4, rate: 90, life: 1.2, origin: atHead, dir: [0, 0.3, 0], spread: 1, speed: 2.5, grav: 0.5, size: 0.35, color: 0xfff1c4 });
    for (const [t0, t1, big] of [[44.96, 52.6, 1], [63.9, 71.2, 0.6], [114.88, 126.4, 1], [133.75, 141.0, 0.7], [191.97, 203.0, 1], [207.0, 215.0, 0.7], [218.3, 222.2, 0.8], [233.8, 237.2, 1]]) {
      F.emit({ kind: 'heart', t0, t1, rate: 12 * big, life: 3.4, origin: around(4.5, 0.5), dir: [0, 1, 0.08], spread: 0.35, speed: 5, grav: -0.6, drag: 0.7, size: 0.75 });
      F.emit({ kind: 'spark', t0, t1, rate: 120 * big, life: 1.8, origin: around(5, 0.5), dir: [0, 1, 0], spread: 0.8, speed: 4, grav: -0.5, size: 0.45 });
      F.emit({ kind: 'confetti', t0, t1: t0 + 2.2, rate: 90 * big, life: 4.5, origin: (tb, i) => V3((U.hash(i) - 0.5) * 30, 26, (U.hash(i + 9) - 0.5) * 20), dir: [0, -0.2, 0], spread: 0.3, speed: 1, grav: -2.2, drag: 1.4, size: 1 });
    }
    // drop bursts
    for (const t0 of [44.96, 114.88, 191.97, 236.72]) {
      F.emit({ kind: 'heart', t0, t1: t0 + 0.25, rate: 260, life: 2.6, origin: atPhone, dir: [0, 1, 0.25], spread: 1.0, speed: 14, grav: -3, drag: 1.3, size: 0.9 });
      F.emit({ kind: 'spark', t0, t1: t0 + 0.2, rate: 2500, life: 1.4, origin: atHead, dir: [0, 0, 0], spread: 1, speed: 16, grav: -2, drag: 2.2, size: 0.6 });
    }
    // clout rain: gold hearts falling
    F.emit({ kind: 'heart', t0: 104.8, t1: 106.6, rate: 60, life: 2.6, origin: (tb, i) => V3(S.girlPos.x + (U.hash(i) - 0.5) * 16, 16, S.girlPos.z + (U.hash(i + 4) - 0.5) * 10), dir: [0, -1, 0], spread: 0.15, speed: 2, grav: -6, drag: 0.2, size: 0.8, color: 0xffc94a });
    // filter sparkles and dance-break sparkle rings
    F.emit({ kind: 'spark', t0: 82.8, t1: 90.3, rate: 140, life: 2.2, origin: around(6, 0.2), dir: [0, 1, 0], spread: 0.5, speed: 3, grav: 0, size: 0.4 });
    F.emit({ kind: 'confetti', t0: 233.8, t1: 237.2, rate: 260, life: 5, origin: (tb, i) => V3((U.hash(i) - 0.5) * 34, 28, (U.hash(i + 9) - 0.5) * 24), dir: [0, -0.2, 0], spread: 0.3, speed: 1, grav: -2.2, drag: 1.4, size: 1 });
    // tears sparkle in the bridge
    F.emit({ kind: 'spark', t0: 163.6, t1: 172.5, rate: 18, life: 1.5, origin: atHead, dir: [0, -1, 0.3], spread: 0.3, speed: 1.2, grav: -1, size: 0.25, color: 0x9fd8ff });

    // screens, fans, clapper, ball, chair
    F.screenState = t => ({
      on: Math.max(U.env(t, 52.7, 75.9, 1.6, 0.8), U.env(t, 122.5, 161.0, 1.6, 2.0), U.env(t, 175.4, 189.5, 1.2, 0.6), U.env(t, 199.6, 222.2, 1.6, 1.2)),
      turn: U.env(t, 177.6, 189.5, 2.4, 0.5),
      dead: Math.max(U.range(t, 154.5, 158.5), U.range(t, 187.1, 188.6)) * (t < 191 ? 1 : 0),
    });
    F.fanState = t => Math.max(U.env(t, 82.8, 90.6, 1.8, 0.6), U.env(t, 114.9, 157.0, 2.0, 3.4), U.env(t, 199.6, 240.4, 2.0, 1.8));
    F.clapState = t => {
      if (t >= 27.4 && t <= 29.0) return { t0: 27.4, t1: 29.0, clap: 28.26, text: '12', pos: V3(S.head.x - 0.6, S.head.y + 0.6, S.head.z + 3.2) };
      if (t >= 95.6 && t <= 97.1) return { t0: 95.6, t1: 97.1, clap: 96.36, text: '13', pos: V3(S.head.x + 1.5, S.head.y + 0.4, S.head.z + 3.0) };
      if (t >= 165.3 && t <= 167.6) return { t0: 165.3, t1: 167.6, clap: 166.54, text: '5', pos: V3(S.head.x - 3.4, S.head.y + 0.6, S.head.z + 1.0), scale: 0.8 };
      return null;
    };
    F.chairState = t => U.env(t, 182.7, 187.4, 0.5, 0.6);
    F.chair.position.set(7.2, PY(), 0.6); F.chair.rotation.y = -0.9;
    F.ballState = ballAt;
  }

  // ball: carried by the dog, rolled, thrown, caught
  function ballAt(t) {
    const mouth = () => V3(S.dogHead.x, S.dogHead.y - 0.55, S.dogHead.z).addScaledVector(S.dogFwd, 1.25);
    const feet = V3(S.girlPos.x + 0.3, PY() + 0.7, S.girlPos.z + 1.6);
    if (t >= 71.0 && t < 73.4) return { pos: mouth() };
    if (t >= 73.4 && t < 75.9) return { pos: V3(U.lerp(mouth().x, feet.x, U.out(U.range(t, 73.4, 74.2))), PY() + 0.7, U.lerp(mouth().z, feet.z, U.out(U.range(t, 73.4, 74.2)))) };
    if (t >= 140.6 && t < 142.6) return { pos: mouth() };
    if (t >= 142.6 && t < 145.3) { const k = U.out(U.range(t, 142.6, 145.3)); return { pos: V3(U.lerp(1.9, 12, k), PY() + 0.7, U.lerp(5.4, 9, k)) }; }
    if (t >= 189.6 && t < 191.1) return { pos: mouth() };
    if (t >= 191.1 && t < 191.97) return { pos: S.handPos.clone() };
    if (t >= 191.97 && t < 192.85) { const k = U.range(t, 191.97, 192.85); const a = S.handPos, b = V3(4.5, 4.4, 5.2); return { pos: V3(U.lerp(a.x, b.x, k), U.lerp(a.y, b.y, k) + 4 * k * (1 - k) * 5, U.lerp(a.z, b.z, k)) }; }
    if (t >= 192.85 && t < 196.0) return { pos: mouth() };
    return null;
  }

  // ---------------------------------------------------------------- per-frame
  const _v = V3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler();
  const Y = V3(0, 1, 0), X = V3(1, 0, 0);
  const qDogLie = new THREE.Quaternion().setFromAxisAngle(X, -Math.PI / 2).multiply(new THREE.Quaternion().setFromAxisAngle(Y, -Math.PI / 2));
  S.dogFwd = V3(0, 0, 1); S.handPos = V3();

  function rides(t) {
    // heart board: [t0, t1] with the girl (and in the finale, the dog) aboard
    for (const [a, b, both] of [[48.58, 51.3, 0], [118.74, 121.3, 0], [195.62, 198.0, 1]]) {
      if (t >= a - 0.3 && t <= b + 0.3) {
        const k = U.range(t, a, b), on = U.env(t, a - 0.3, b + 0.3, 0.3, 0.3);
        const ang = k * TAU * 0.85 - Math.PI / 2;
        return { on, both, x: Math.cos(ang) * 7 * on, z: 2 + Math.sin(ang) * 5 * on, yaw: -ang + Math.PI, h: (1.0 + Math.sin(t * 6) * 0.2) * on };
      }
    }
    return null;
  }

  S.update = function (t, camera, aspect) {
    const C = MV.chars, W = MV.world, F = MV.fx, P = MV.post;
    const look = lookAt(t);
    const girl = S.girl, dog = S.dog;
    const kick = MV.kick(t), loud = MV.env('loud', t);

    // ---- girl
    const gm = evalMoves(GM, C.moves, C.full, C.blendPose, t);
    const gp = pathAt(GP, t);
    let pose = gm.pose;
    const walkC = moveCtx(t, 0, 1, { stride: gp.travel });
    if (gp.moving && gm.name !== 'walk') pose = C.blendPose(pose, C.full(C.moves.walk(walkC)), 0.6);
    else if (gm.name === 'walk') pose = C.full(C.moves.walk(walkC));
    C.applyGirl(girl, pose, t);
    const lie = keyAt(G_LIEKEYS, t, U.out3);
    const inflate = keyAt(INFLATE, t, U.back);
    const ride = rides(t);
    let gx = gp.x, gz = gp.z, yaw = gp.yaw + pose.yaw, lift = 0;
    if (ride) { gx = U.lerp(gx, ride.x, ride.on); gz = U.lerp(gz, ride.z, ride.on); yaw = U.lerp(yaw, ride.yaw, ride.on) + pose.yaw; lift = ride.h; }
    girl.root.position.set(gx, PY() + lift + 1.0 * Math.max(0.03, inflate) * lie, gz);
    girl.root.rotation.set(-Math.PI / 2 * lie + pose.pitch, yaw, pose.roll, 'YXZ');
    girl.root.scale.set(1, 1, Math.max(0.03, inflate));
    girl.root.visible = dog.root.visible = inflate > 0.002;

    // ---- dog
    const dm = evalMoves(DM, C.dogMoves, C.dfull, C.blendDog, t);
    const dp = pathAt(DP, t);
    let dpose = dm.pose;
    if (dp.moving && dm.name !== 'run') dpose = C.blendDog(dpose, C.dfull(C.dogMoves.run(moveCtx(t, 0, 1))), 0.7);
    C.applyDog(dog, dpose, t, dp.moving ? dp.travel / 2.6 * Math.PI * 2 : null);
    const dlie = keyAt(D_LIEKEYS, t, U.out3);
    let dx = dp.x, dz = dp.z, dyaw = dp.yaw + dpose.yaw, dlift = 0;
    if (ride && ride.both) { const a = U.range(t, 195.62, 198.0) * TAU * 0.85 - Math.PI / 2; dx = U.lerp(dx, Math.cos(a) * 7 + Math.cos(a + 1.2) * 1.2, ride.on); dz = U.lerp(dz, 2 + Math.sin(a) * 5 + Math.sin(a + 1.2) * 1.0, ride.on); dlift = ride.h; dyaw = U.lerp(dyaw, -a + Math.PI, ride.on); }
    if (dlie < 0.5 && !(ride && ride.both)) {
      const fwd = { x: Math.sin(dyaw), z: Math.cos(dyaw) }, dr = { x: dx, z: dz };
      const contact = dm.name === 'lapHead' || gm.name === 'hugDog' || dm.name === 'nudge';
      const gR = pose.hipsY >= 0 ? 2.0 : 1.55;
      MV.phys.separate({ x: gx, z: gz }, gR, dr, fwd, contact ? -0.75 : 0.15);
      dx = dr.x; dz = dr.z;
    }
    dog.root.position.set(dx, PY() + dlift + 1.2 * Math.max(0.03, inflate) * dlie, dz);
    _q.setFromAxisAngle(Y, dyaw);
    dog.root.quaternion.copy(_q).slerp(qDogLie, dlie);
    dog.root.scale.set(Math.max(0.03, inflate), 1, 1);
    dog.root.updateMatrixWorld(true);
    S.dogFwd.set(0, 0, 1).applyQuaternion(dog.root.quaternion);
    dog.J.head.getWorldPosition(S.dogHead);
    dog.root.getWorldPosition(S.dogPos);

    // board
    S.board.visible = !!(ride && ride.on > 0.02);
    if (S.board.visible) { S.board.position.set(gx, PY() + lift - 0.25, gz); S.board.rotation.set(-Math.PI / 2, 0, yaw + Math.PI); S.board.scale.setScalar(Math.max(0.001, U.back(ride.on))); }

    girl.root.updateMatrixWorld(true);
    // physics: arm IK with collision, then hair, skirt and the dog's ears
    S.dogNeck = S.dogNeck || V3(); S.dogSide = S.dogSide || V3();
    dog.J.neck.getWorldPosition(S.dogNeck); S.dogSide.set(1, 0, 0).applyQuaternion(dog.root.quaternion);
    MV.phys.solveGirl(girl, pose, S);
    const pdt = S.lastT === undefined ? -1 : t - S.lastT; S.lastT = t;
    MV.phys.simGirl(girl, pdt);
    MV.phys.simDog(dog, pdt);
    girl.root.updateMatrixWorld(true);
    girl.J.head.getWorldPosition(S.head); S.head.y += girl.J.hc * 0.6;
    girl.root.getWorldPosition(S.girlPos);
    girl.J.handPhone.getWorldPosition(S.phonePos);
    girl.J.rWr.getWorldPosition(S.handPos);

    // flying phone
    S.flyPhone.visible = false;
    if (t >= 183.9 && t < 184.7) { const k = U.range(t, 183.9, 184.7); S.flyPhone.visible = true; S.flyPhone.position.set(U.lerp(S.handPos.x, 13, k), U.lerp(S.handPos.y, PY() + 0.2, k) + Math.sin(Math.PI * k) * 4, U.lerp(S.handPos.z, 8, k)); S.flyPhone.rotation.set(k * 9, k * 5, 0); }
    else if (t >= 184.7 && t < 185.3) { S.flyPhone.visible = true; S.flyPhone.position.set(13, PY() + 0.1, 8); S.flyPhone.rotation.set(-Math.PI / 2, 0, 0.4); }
    else if (t >= 185.3 && t < 185.75) { const k = U.range(t, 185.3, 185.75); S.flyPhone.visible = true; S.flyPhone.position.set(U.lerp(13, S.handPos.x, k), U.lerp(PY() + 0.1, S.handPos.y, k) + Math.sin(Math.PI * k) * 3, U.lerp(8, S.handPos.z, k)); S.flyPhone.rotation.set(k * 7, -k * 4, 0); }
    // phone buzzing then stopping
    if (t >= 189.3 && t < 190.5) girl.J.handPhone.position.x = Math.sin(t * 90) * 0.06; else girl.J.handPhone.position.x = 0;
    // phone screen glow
    const ringing = t >= 203.6 && t < 206.4;
    girl.J.handPhone.userData.screen.material.color.setHex(ringing ? 0x6dff9e : 0x9fc4ff).multiplyScalar(1.4 + look.phone * 1.5);

    // ghost of her soul
    S.ghost.visible = t >= 101.0 && t <= 103.6;
    if (S.ghost.visible) {
      const k = U.range(t, 101.0, 103.6);
      S.ghost.position.copy(girl.root.position).add(V3(0, U.out(k) * 9, -U.out(k) * 3));
      S.ghost.rotation.set(0, girl.root.rotation.y, 0);
      S.ghost.scale.setScalar(1 + k * 0.3);
      S.ghostMat.opacity = 0.22 * Math.sin(Math.PI * k);
    }

    // ---- camera
    placeCamera(t, camera, aspect, kick);

    // jump out of the screen (girl leaves the paper and comes close to the lens)
    const jumpOut = U.env(t, 227.3, 230.5, 0.7, 0.75);
    if (jumpOut > 0) {
      const fwd = V3(0, 0, -1).applyQuaternion(camera.quaternion), up = V3(0, 1, 0).applyQuaternion(camera.quaternion);
      const close = camera.position.clone().addScaledVector(fwd, 8.5).addScaledVector(up, -C.G.headC * 0.82);
      const e = U.inOut(jumpOut);
      girl.root.position.lerp(close, e).addScaledVector(Y, Math.sin(Math.PI * e) * (t < 228.8 ? 3 : 2.5));
      _q.setFromEuler(_e.set(0, yaw, 0, 'YXZ'));
      girl.root.quaternion.copy(_q).slerp(camera.quaternion, e);
      girl.root.updateMatrixWorld(true);
    }
    // pop-out: let her break the frame when she comes at the lens
    const pop = jumpOut > 0.05 || (t >= 40.4 && t < 41.95) || (t >= 109.0 && t < 111.95) || (t >= 226.0 && t < 231.0);
    if (pop !== S.popGirl) { MV.setLayers(girl.root, pop); MV.setLayers(dog.root, pop); S.popGirl = pop; }

    // ---- pencil
    updatePencil(t);
    updateInk(t);
    W.ink.material.opacity = 1 - U.c01(inflate * 1.1);
    W.ink.visible = W.ink.material.opacity > 0.01;

    // coloured pencils swoop at each drop
    W.colorPencils.forEach((p, i) => {
      let on = 0, tt = 0;
      for (const t0 of [44.96, 114.88, 191.97]) if (t >= t0 - 0.6 && t < t0 + 3.4) { on = U.env(t, t0 - 0.6, t0 + 3.4, 0.5, 0.8); tt = t - t0; }
      const trail = W.trails[i];
      if (on <= 0) { p.root.position.copy(p.rest); p.root.rotation.set(0, 0.25 + i * 0.03, 0); p.tilt.rotation.set(0, 0, Math.PI / 2); trail.count = 0; return; }
      const path = (tau) => { const a = tau * 3.2 + i * Math.PI / 2, r = 7.5 - tau * 1.2; return V3(S.girlPos.x + Math.cos(a) * r, 2.5 + tau * 2.4 + Math.sin(tau * 5 + i) * 0.8, S.girlPos.z + Math.sin(a) * r); };
      const pos = path(tt), nxt = path(tt + 0.03);
      p.root.position.lerpVectors(p.rest, pos, U.smooth(on));
      p.root.lookAt(nxt); p.tilt.rotation.set(Math.PI / 2, 0, 0);
      const m = new THREE.Matrix4();
      let n = 0;
      for (let k = 0; k < 96; k++) { const tau = tt - k * 0.008; if (tau < -0.4) break; const q = path(tau); const s = (1 - k / 96) * on; m.makeScale(s, s, s).setPosition(q.x, q.y, q.z); trail.setMatrixAt(n++, m); }
      trail.count = n; trail.instanceMatrix.needsUpdate = true;
    });

    // ---- lights + grade
    const chorusPulse = look.rim * kick;
    W.ringMat.emissiveIntensity = look.ring * (2.4 + 1.6 * kick * look.rim);
    W.ringLight.intensity = look.ring * (0.85 + 0.35 * kick * look.rim);
    W.beamMat.uniforms.uO.value = look.ring * (0.025 + 0.02 * kick * look.rim);
    W.hemi.intensity = look.hemi;
    W.key.intensity = look.key;
    W.key.color.setRGB(0.75 + 0.25 * (1 - look.cool), 0.82 + 0.1 * (1 - look.cool), 1.0);
    const hue = (MV.beatPos(t) * 0.125) % 1;
    W.rimA.intensity = look.rim * (1.6 + 2.4 * chorusPulse); W.rimA.color.setHSL((0.92 + hue) % 1, 0.9, 0.55);
    W.rimB.intensity = look.rim * (1.6 + 2.4 * chorusPulse); W.rimB.color.setHSL((0.52 + hue) % 1, 0.9, 0.55);
    W.phoneGlow.intensity = look.phone * 1.6;
    W.phoneGlow.position.copy(S.phonePos).add(V3(0, 0.6, 0.8));
    W.bokeh.forEach(s => { s.material.opacity = look.bok * (s.userData.base + 0.25 * Math.sin(t * 1.3 + s.userData.ph)) * (1 + 0.6 * kick * look.rim); });
    MV.ink.width.value = look.ink;
    let flash = 0; for (const [ft, a] of FLASH) if (t >= ft && t < ft + 0.6) flash = Math.max(flash, a * Math.exp(-(t - ft) * 7));
    let whip = 0, wdir = 1; for (let i = 0; i < SWIPES.length; i++) { const d = t - SWIPES[i] + 0.06; if (Math.abs(d) < 0.17) { whip = Math.sin(Math.PI * (0.5 - Math.abs(d) / 0.34)) * 0.75; wdir = i % 2 ? 1 : -1; } }
    let glitch = 0; for (const [a, b] of GLITCH) if (t >= a && t <= b) glitch = 1;
    P.sat.value = look.sat;
    P.exposure.value = look.exp * (1 + 0.06 * kick * look.rim);
    P.vignette.value = look.vig === undefined ? 0.4 : look.vig;
    P.tilt.value = look.tilt;
    P.tiltY.value = 0.48;
    P.flash.value = flash;
    P.whip.value.set(0, whip * 0.09 * wdir);
    P.glitch.value = glitch;
    P.ca.value = 0.0025 + 0.012 * kick * look.rim + glitch * 0.02 + whip * 0.01;
    P.tint.value.set(1 + look.warm * 0.12 - look.cool * 0.08, 1 + look.warm * 0.02 - look.cool * 0.02, 1 - look.warm * 0.1 + look.cool * 0.14);
    P.fade.value = Math.max(1 - U.range(t, 0.0, 1.4), U.range(t, 245.6, 246.6));
    MV.bloom.strength = 0.7 + 0.5 * look.rim + 0.35 * kick * look.rim;
    const envK = 0.35 + 0.45 * look.ring + 0.2 * look.rim;
    if (MV.envMats && Math.abs(envK - (S.envK || -1)) > 0.01) { S.envK = envK; for (const m of MV.envMats) m.envMapIntensity = m.userData.envBase * envK; }
    // soft contact shadows
    const gh = Math.max(0, S.girlPos.y - PY()), dh = Math.max(0, S.dogPos.y - PY());
    S.blobG.position.set(S.girlPos.x, PY() + 0.03, S.girlPos.z); S.blobG.scale.setScalar(1 + gh * 0.12);
    S.blobG.material.opacity = 0.55 * U.c01(1 - gh / 7) * U.c01(inflate) * (1 - lie);
    S.blobD.position.set(S.dogPos.x, PY() + 0.03, S.dogPos.z); S.blobD.rotation.set(-Math.PI / 2, 0, dyaw); S.blobD.scale.setScalar(1 + dh * 0.12);
    S.blobD.material.opacity = 0.5 * U.c01(1 - dh / 7) * U.c01(inflate) * (1 - dlie);

    F.update(t, camera);
    S.look = look;
  };

  // ---------------------------------------------------------------- camera
  const camT = V3(), camP = V3(), tmpA = V3(), tmpB = V3();
  function resolveTarget(tg, out) {
    if (Array.isArray(tg)) return out.set(tg[0], tg[1], tg[2]);
    switch (tg) {
      case 'girl': return out.copy(S.girlPos).add(V3(0, 5.6, 0));
      case 'head': return out.copy(S.head).add(V3(0, -0.4, 0));
      case 'dog': return out.copy(S.dogPos).add(V3(0, 2.6, 0));
      case 'duo': return out.copy(S.girlPos).add(S.dogPos).multiplyScalar(0.5).add(V3(0, 3.6, 0));
      case 'phone': return out.copy(S.phonePos);
      case 'pencil': return out.copy(MV.world.pencil.root.position).add(V3(0, 1.5, 0));
      case 'drawGirl': return out.set(GIRL_LIE.x + 0.5, 0, GIRL_LIE.z - 4.5);
      case 'drawGirlHead': return out.set(GIRL_LIE.x, 0, GIRL_LIE.z - MV.chars.G.headC);
      case 'ringMid': return out.set(6, 7, 6);
      default: return out.set(0, 4, 2);
    }
  }
  // One shot's camera at time t: { pos, tg, fov, roll }
  function shotPose(i, t, aspect, out) {
    const sh = SH[i], t1 = i + 1 < SH.length ? SH[i + 1].t : sh.t + 6;
    const raw = U.c01((t - sh.t) / (t1 - sh.t));
    const k = sh.ease === 'lin' ? raw : sh.ease === 'in' ? U.in2(raw) : U.inOut(raw);
    const a = sh.a, b = sh.b;
    resolveTarget(a.tg, tmpA); resolveTarget(b.tg, tmpB);
    out.tg.lerpVectors(tmpA, tmpB, k);
    if (a.pov === 'ring') {
      MV.world.ringPhone.getWorldPosition(out.pos);
      out.pos.lerp(out.tg, 0.12);
      _v.subVectors(out.pos, out.tg);
      out.d = _v.length(); out.el = Math.asin(U.clamp(_v.y / out.d, -1, 1)); out.az = Math.atan2(_v.x, _v.z);
    } else {
      out.az = U.lerp(a.az, b.az, k) * DEG; out.el = U.lerp(a.el, b.el, k) * DEG;
      let d = U.lerp(a.d, b.d, k);
      if (a.tg === 'girl' || a.tg === 'duo') d = Math.max(d, 16.5);
      if (aspect < 1) d *= 1 + U.c01((d - 8) / 25) * 0.75 + 0.18 * (1 - aspect);
      out.d = d;
    }
    out.fov = U.lerp(a.fov || 34, b.fov || 34, k);
    out.roll = U.lerp(a.roll || 0, b.roll || 0, k) * DEG;
    out.punch = !!sh.punch; out.h = sh.h || 0.25;
    return out;
  }
  const PA = { pos: V3(), tg: V3() }, PB = { pos: V3(), tg: V3() };
  const cam = { pos: V3(), tg: V3(), vp: V3(), vt: V3(), last: null };
  // critically damped follow, exact for any time step
  function follow(x, v, goal, w, dt) {
    const e = Math.exp(-w * dt);
    _v.subVectors(x, goal);
    const tmp = _v.clone().multiplyScalar(w).add(v).multiplyScalar(dt);
    v.sub(tmp.clone().multiplyScalar(w)).multiplyScalar(e);
    x.copy(goal).add(_v.add(tmp).multiplyScalar(e));
  }
  function placeCamera(t, camera, aspect, kick) {
    let i = 0; while (i < SH.length - 1 && SH[i + 1].t <= t) i++;
    // blend into the next shot (or out of the previous one) instead of cutting
    let ia = i, ib = i, w = 0;
    const next = SH[i + 1], prev = SH[i];
    const trOf = s => s.tr || (SWIPES.some(x => Math.abs(x - s.t) < 0.05) ? 0.34 : 1.1);
    if (next) { const tr = trOf(next); if (t > next.t - tr * 0.65) { ia = i; ib = i + 1; w = U.range(t, next.t - tr * 0.65, next.t + tr * 0.35); } }
    if (w === 0 && i > 0) { const tr = trOf(prev); if (t < prev.t + tr * 0.35) { ia = i - 1; ib = i; w = U.range(t, prev.t - tr * 0.65, prev.t + tr * 0.35); } }
    shotPose(ia, t, aspect, PA);
    if (ia !== ib) shotPose(ib, t, aspect, PB);
    const e = U.smooth(U.smooth(w));
    const P = ia === ib ? PA : PB;
    camT.lerpVectors(PA.tg, P.tg, e);
    let dAz = P.az - PA.az; dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
    const az = PA.az + dAz * e, el = U.lerp(PA.el, P.el, e);
    // pull back a little mid-move, like a crane, so the camera never skims through anyone
    const d = U.lerp(PA.d, P.d, e) * (1 + 0.18 * Math.sin(Math.PI * e) * U.c01(Math.abs(dAz) / 1.2));
    camP.set(camT.x + Math.sin(az) * Math.cos(el) * d, camT.y + Math.sin(el) * d, camT.z + Math.cos(az) * Math.cos(el) * d);
    if (camP.y < 0.8) camP.y = 0.8;
    // spring follow: weight and inertia, like a real operator
    const dt = cam.last === null ? -1 : t - cam.last; cam.last = t;
    if (dt <= 0 || dt > 0.25) { cam.pos.copy(camP); cam.tg.copy(camT); cam.vp.set(0, 0, 0); cam.vt.set(0, 0, 0); }
    else { follow(cam.pos, cam.vp, camP, 9, dt); follow(cam.tg, cam.vt, camT, 11, dt); }
    // keep the lens out of her head
    _v.subVectors(cam.pos, S.head); if (_v.length() < 4.2) cam.pos.copy(S.head).addScaledVector(_v.normalize(), 4.2);
    const h = U.lerp(PA.h, P.h, e) * 0.35;
    camera.position.copy(cam.pos);
    camera.position.x += U.fbm(t * 0.6 + 3) * h; camera.position.y += U.fbm(t * 0.5 + 9) * h; camera.position.z += U.fbm(t * 0.55 + 17) * h;
    camera.lookAt(cam.tg);
    camera.rotateZ(U.lerp(PA.roll, P.roll, e) + U.fbm(t * 0.4 + 30) * 0.01);
    const fov = U.lerp(PA.fov, P.fov, e) - ((PA.punch || P.punch) ? kick * 1.6 : 0);
    camera.fov = aspect < 1 ? fov * 1.06 : fov;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- pencil drawing
  const PAPER = () => MV.world;
  function strokeProgress(s, t) { return U.c01((t - s.t0) / (s.t1 - s.t0)); }
  function pointAt(s, dist) {
    if (dist <= 0) return s.pts[0];
    if (dist >= s.len) return s.pts[s.pts.length - 1];
    let i = 1; while (s.cum[i] < dist) i++;
    const f = (dist - s.cum[i - 1]) / (s.cum[i] - s.cum[i - 1] || 1), a = s.pts[i - 1], b = s.pts[i];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  }
  function drawStrokeRange(ctx, s, d0, d1) {
    const W = PAPER();
    const toP = p => W.toPaper(p[0], p[1]);
    ctx.lineWidth = Math.max(1.5, s.w * 48.8); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(38,37,44,0.92)';
    ctx.beginPath();
    let p = toP(pointAt(s, d0)); ctx.moveTo(p[0], p[1]);
    for (let i = 1; i < s.pts.length; i++) if (s.cum[i] > d0 && s.cum[i] < d1) { p = toP(s.pts[i]); ctx.lineTo(p[0], p[1]); }
    p = toP(pointAt(s, d1)); ctx.lineTo(p[0], p[1]);
    ctx.stroke();
  }
  function updateInk(t) {
    const W = PAPER(), ctx = W.inkCtx, st = S.inkState;
    const drawingT = Math.min(t, 17);
    if (Math.abs(drawingT - st.t) < 1e-4) return;
    const incremental = drawingT > st.t && st.t >= 0 && drawingT - st.t < 0.6;
    if (!incremental) { ctx.clearRect(0, 0, 2048, 1448); st.t = -1; }
    const from = incremental ? st.t : -1;
    // tick-tock taps
    for (const [tt, x, z] of S.taps) if (drawingT >= tt && from < tt) { const p = W.toPaper(x, z); ctx.fillStyle = 'rgba(38,37,44,0.9)'; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, TAU); ctx.fill(); }
    for (const s of S.strokes) {
      const k1 = strokeProgress(s, drawingT), k0 = from < 0 ? 0 : strokeProgress(s, from);
      if (k1 > k0) drawStrokeRange(ctx, s, s.len * k0, s.len * k1);
    }
    st.t = drawingT;
    W.inkTex.needsUpdate = true;
  }
  let titleDrawn = -1;
  function updatePencil(t) {
    const W = PAPER(), pen = W.pencil, OFF = V3(30, 12, 18);
    let pos = OFF.clone(), lifted = 1;
    const taps = S.taps;
    if (t < 2.98) {
      // hover and tap on the words "tick tock"
      let tip = V3(-7, 0, -7);
      for (let i = 0; i < taps.length; i++) { const [tt, x, z] = taps[i]; if (t >= tt - 0.3) tip = V3(x, 0, z); }
      let down = 0; for (const [tt] of taps) down = Math.max(down, Math.exp(-Math.pow((t - tt) / 0.07, 2)));
      const enter = U.out3(U.range(t, 0, 0.6));
      pos.lerpVectors(OFF, tip.setY(PY() + 0.02 + (1 - down) * 0.9), enter);
    } else if (t < 17.2) {
      let cur = null, next = null;
      for (const s of S.strokes) { if (t >= s.t0 && t <= s.t1) { cur = s; break; } if (t < s.t0) { next = next || s; } }
      if (cur) { const p = pointAt(cur, cur.len * strokeProgress(cur, t)); pos.set(p[0], PY() + 0.02, p[1]); lifted = 0; }
      else {
        const prev = S.strokes.filter(s => s.t1 <= t).pop();
        const nx = S.strokes.find(s => s.t0 > t);
        if (prev && nx) { const a = prev.pts[prev.pts.length - 1], b = nx.pts[0], k = U.range(t, prev.t1, nx.t0); pos.set(U.lerp(a[0], b[0], k), PY() + 0.02 + Math.sin(Math.PI * k) * 0.8, U.lerp(a[1], b[1], k)); }
        else if (prev) { const a = prev.pts[prev.pts.length - 1]; const k = U.out3(U.range(t, prev.t1, 17.2)); pos.lerpVectors(V3(a[0], PY(), a[1]), OFF, k); }
      }
    } else if (t >= 242.0 && t < 246.5) {
      const T = S.title, k = U.range(t, T.t0, T.t1);
      const enter = U.out3(U.range(t, 242.0, T.t0)), exit = U.in2(U.range(t, T.t1, 246.4));
      const tipX = T.x - T.size * 3.2 + k * T.size * 6.4;
      const tip = V3(tipX, PY() + 0.02 + (k > 0 && k < 1 ? Math.abs(Math.sin(t * 22)) * 0.25 : 0.6), T.z + Math.sin(t * 17) * T.size * 0.18);
      pos.lerpVectors(OFF, tip, enter).lerp(OFF, exit);
      drawTitle(k);
    }
    pen.root.position.copy(pos);
    pen.tilt.rotation.set(0.3 + 0.03 * Math.sin(t * 7), 0, -0.55 + 0.04 * Math.sin(t * 11) * (1 - lifted));
    pen.root.visible = t < 17.5 || (t > 241.8 && t < 246.6);
    if (t < 242) drawTitle(0);
  }
  function drawTitle(k) {
    const q = Math.round(k * 200) / 200;
    if (q === titleDrawn) return;
    titleDrawn = q;
    const W = PAPER(), ctx = W.noteCtx, T = S.title;
    ctx.clearRect(0, 0, 2048, 1448);
    if (q <= 0) { W.noteTex.needsUpdate = true; return; }
    const c = W.toPaper(T.x, T.z), px = T.size * 48.8;
    ctx.save();
    ctx.font = `700 ${px}px 'Kalam', 'Comic Sans MS', cursive`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(T.text).width;
    ctx.beginPath(); ctx.rect(c[0] - w / 2 - 20, c[1] - px, (w + 40) * q, px * 2); ctx.clip();
    ctx.fillStyle = 'rgba(38,37,44,0.92)'; ctx.fillText(T.text, c[0], c[1]);
    ctx.fillStyle = '#ff3d8b'; ctx.font = `700 ${px * 0.8}px 'Kalam', cursive`; ctx.fillText('♥', c[0] + w / 2 + px * 0.55, c[1] - px * 0.05);
    ctx.restore();
    W.noteTex.needsUpdate = true;
  }
  S.resetInk = () => { S.inkState.t = -1; titleDrawn = -1; };
})();
