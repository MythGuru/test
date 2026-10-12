const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [w, h, ...times] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8766/test.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
  fs.mkdirSync('shots', { recursive: true });
  const t0 = Date.now();
  for (const t of times) { const url = await p.evaluate(([t, w, h]) => SLcap(t, w, h), [+t, +w, +h]); fs.writeFileSync(`shots/${w}x${h}_${t}.jpg`, Buffer.from(url.split(',')[1], 'base64')); }
  console.log('ms/frame', (Date.now() - t0) / times.length, errs.join('\n'));
  await b.close();
})();
