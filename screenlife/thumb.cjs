const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8766/test.html'); await p.waitForFunction(() => window.__ready);
  const url = await p.evaluate(() => {
    const W = 1280, H = 720, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const a = document.createElement('canvas'); a.width = 1080; a.height = 1920; const b2 = document.createElement('canvas'); b2.width = 1080; b2.height = 1920;
    SL.captions = false;
    SL.render(a, 23.9); SL.render(b2, 51.95);
    x.fillStyle = '#0a0612'; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W * 0.7, H * 0.5, 0, W * 0.7, H * 0.5, W * 0.6); g.addColorStop(0, '#5a1a7a'); g.addColorStop(1, '#0a0612'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const phone = (src, cx, rot, s) => { x.save(); x.translate(cx, H / 2 + 20); x.rotate(rot); const h = H * 0.9 * s, w = h * 9 / 16; x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 40; x.fillStyle = '#c9c5bf'; SL.UI.rr(x, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 46); x.fill(); x.shadowBlur = 0; x.save(); SL.UI.rr(x, -w / 2, -h / 2, w, h, 38); x.clip(); x.drawImage(src, -w / 2, -h / 2, w, h); x.restore(); x.restore(); };
    phone(a, 330, -0.08, 0.92); phone(b2, 950, 0.07, 1.0);
    // the arrow between them
    x.strokeStyle = '#ffe14d'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(560, 380); x.lineTo(720, 380); x.stroke(); x.beginPath(); x.moveTo(690, 340); x.lineTo(735, 380); x.lineTo(690, 420); x.stroke();
    x.font = "900 92px Montserrat"; x.textAlign = 'center'; x.lineJoin = 'round'; x.lineWidth = 18; x.strokeStyle = '#000';
    x.strokeText('TIKTOK FAMOUS', W / 2, 120); x.fillStyle = '#fff'; x.fillText('TIKTOK FAMOUS', W / 2, 120);
    return c.toDataURL('image/jpeg', 0.92);
  });
  fs.writeFileSync('/home/user/test/screenlife/thumbnail_1280x720.jpg', Buffer.from(url.split(',')[1], 'base64'));
  await b.close(); console.log('ok');
})();
