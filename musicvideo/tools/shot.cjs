const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [w, h, ...times] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
  await p.goto('http://localhost:8765/test.html?capture', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__ready || document.getElementById('error').hidden === false, null, { timeout: 120000 }).catch(e => errs.push('timeout ' + e.message));
  const err = await p.evaluate(() => document.getElementById('error').hidden ? '' : document.getElementById('error').textContent);
  if (err) errs.push('UIERR ' + err);
  await p.evaluate(([w, h]) => MV.capture.setup(w, h), [+w, +h]).catch(e => errs.push('setup ' + e.message));
  fs.mkdirSync('shots', { recursive: true });
  for (const t of times) {
    const t0 = Date.now();
    const url = await p.evaluate(t => MV.capture.frame(t), +t).catch(e => { errs.push('frame ' + t + ' ' + e.message); return null; });
    if (url) fs.writeFileSync(`shots/${w}x${h}_${t}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    console.log('t', t, (Date.now() - t0) + 'ms');
  }
  console.log([...new Set(errs)].slice(0, 30).join('\n'));
  await b.close();
})();
