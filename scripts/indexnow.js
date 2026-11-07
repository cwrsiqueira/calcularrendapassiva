// Avisa Bing/Yandex (IndexNow) que as URLs do sitemap mudaram. Uso: node scripts/indexnow.js
const fs = require('fs');
const path = require('path');

const HOST = 'calcularrendapassiva.com';
const KEY = '98b4a40f84f382c9360e38a2bf94e1be';

async function main() {
  const sitemap = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
    signal: AbortSignal.timeout(60000),
  });
  console.log(`IndexNow: ${urlList.length} URLs → HTTP ${r.status}`);
  if (r.status >= 400) process.exit(1);
}

main().catch(e => { console.error('IndexNow falhou:', e.message); process.exit(1); });
