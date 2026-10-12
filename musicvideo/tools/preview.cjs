const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const [W, H, T0, T1, OUT] = [+process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5], process.argv[6]];
const FPS = 30;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.error('ERR', e.message));
  await p.goto('http://localhost:8765/test.html?capture');
  await p.waitForFunction(() => window.__ready, null, { timeout: 180000 });
  await p.evaluate(([w, h]) => MV.capture.setup(w, h), [W, H]);
  // warm up the physics and camera springs for a second before the clip starts
  for (let t = Math.max(0, T0 - 1); t < T0; t += 1 / FPS) await p.evaluate(t => { MV.capture.frame(t); return 0; }, t);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-ss', String(T0), '-t', String(T1 - T0), '-i', __dirname + '/song.mp3',
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT]);
  const n = Math.round((T1 - T0) * FPS), t0 = Date.now();
  for (let f = 0; f < n; f++) {
    const url = await p.evaluate(t => MV.capture.frame(t), T0 + f / FPS);
    if (!ff.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log('frame', f, 'of', n, ((Date.now() - t0) / (f + 1)).toFixed(0) + 'ms/frame');
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('DONE', OUT);
  await b.close();
})();
