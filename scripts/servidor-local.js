// Servidor local para testar o site montado (dist/) como na Vercel:
// links sem .html (cleanUrls), /pasta → /pasta/index.html. Sem dependências.
// Uso: npm run build && npm run local   →   http://localhost:8765
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const PORTA = Number(process.env.PORT) || 8765;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

function achar(url) {
  const limpo = decodeURIComponent(url.split('?')[0]);
  const base = path.normalize(path.join(DIST, limpo));
  if (!base.startsWith(DIST)) return null; // impede sair da pasta dist
  const candidatos = [base, base + '.html', path.join(base, 'index.html')];
  return candidatos.find(c => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

http.createServer((req, res) => {
  const arquivo = achar(req.url);
  if (!arquivo) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 — não encontrado: ' + req.url);
  }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
  fs.createReadStream(arquivo).pipe(res);
}).listen(PORTA, () => console.log(`Site local em http://localhost:${PORTA} (a API de e-mail não roda aqui)`));
