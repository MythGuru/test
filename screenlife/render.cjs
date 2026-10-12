// node render.cjs <w> <h> <t0> <t1> <out.mp4>  — renders song time t0..t1 with the matching audio
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const [W, H, T0, T1, OUT] = [+process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5], process.argv[6]];
const FPS = 30;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.error('ERR', e.message));
  await p.goto('http://localhost:8766/test.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
  const dur = T1 - T0;
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-ss', String(T0), '-t', String(dur), '-i', __dirname + '/song.mp3',
    '-map', '0:v', '-map', '1:a', '-af', `afade=t=in:d=0.03,afade=t=out:st=${(dur - 0.05).toFixed(3)}:d=0.05`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', OUT]);
  const n = Math.round(dur * FPS), t0 = Date.now();
  for (let f = 0; f < n; f++) {
    const url = await p.evaluate(([t, w, h]) => SLcap(t, w, h), [T0 + f / FPS, W, H]);
    if (!ff.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log('frame', f, '/', n, ((Date.now() - t0) / (f + 1)).toFixed(0) + 'ms');
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('DONE', OUT, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  await b.close();
})();
