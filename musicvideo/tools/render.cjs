// Renders the video in resumable chunks: node render.cjs <w> <h> <name>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const [W, H, NAME] = [+process.argv[2], +process.argv[3], process.argv[4]];
const FPS = 30, DUR = 246.76, N = Math.ceil(DUR * FPS), CH = 600;
const dir = path.join(__dirname, 'render', NAME); fs.mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.error('ERR', e.message));
  await p.goto('http://localhost:8765/test.html?capture');
  await p.waitForFunction(() => window.__ready, null, { timeout: 180000 });
  await p.evaluate(([w, h]) => MV.capture.setup(w, h), [W, H]);
  for (let c = 0; c * CH < N; c++) {
    const out = path.join(dir, `chunk_${String(c).padStart(3, '0')}.mp4`);
    if (fs.existsSync(out)) continue;
    const tmp = out + '.part.mp4';
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', tmp]);
    const t0 = Date.now();
    for (let f = c * CH; f < Math.min(N, (c + 1) * CH); f++) {
      const url = await p.evaluate(t => MV.capture.frame(t), f / FPS);
      const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    fs.renameSync(tmp, out);
    console.log(new Date().toISOString(), NAME, 'chunk', c, 'of', Math.ceil(N / CH), ((Date.now() - t0) / CH).toFixed(0) + 'ms/frame');
  }
  await b.close();
  // join chunks and add the song
  const list = fs.readdirSync(dir).filter(f => /^chunk_\d+\.mp4$/.test(f)).sort().map(f => `file '${path.join(dir, f)}'`).join('\n');
  fs.writeFileSync(path.join(dir, 'list.txt'), list);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-i', path.join(__dirname, 'song.mp3'),
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', path.join(__dirname, 'render', `TikTok_Famous_${NAME}.mp4`)]);
  console.log('DONE', NAME);
})();
