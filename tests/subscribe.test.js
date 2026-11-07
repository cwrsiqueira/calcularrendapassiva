// Testes de api/subscribe.js — rode com: npm test
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/subscribe.js');

const HOST = 'calcularrendapassiva.com';
let chamadasBrevo;

beforeEach(() => {
  handler._limparLimite();
  chamadasBrevo = [];
  process.env.BREVO_API_KEY = 'chave-falsa-de-teste';
  delete process.env.BREVO_LIST_ID;
  delete process.env.BREVO_LIST_ID_EN;
  global.fetch = async (url, opts) => {
    chamadasBrevo.push(JSON.parse(opts.body));
    return { status: 201, json: async () => ({}) };
  };
});

function pedido({ body = {}, method = 'POST', origin = `https://${HOST}`, ip = '1.1.1.1' } = {}) {
  const headers = { host: HOST, 'x-forwarded-for': ip };
  if (origin) headers.origin = origin;
  return { method, headers, body };
}

async function chamar(req) {
  const res = { statusCode: 0, corpo: null };
  res.status = code => { res.statusCode = code; return res; };
  res.json = obj => { res.corpo = obj; return res; };
  await handler(req, res);
  return res;
}

test('cadastra e-mail válido na lista PT', async () => {
  const res = await chamar(pedido({ body: { email: ' Ana@Exemplo.com ', lang: 'pt' } }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(chamadasBrevo, [{ email: 'ana@exemplo.com', listIds: [11], updateEnabled: true }]);
});

test('lang=en vai para a lista 12', async () => {
  await chamar(pedido({ body: { email: 'bob@example.com', lang: 'en' } }));
  assert.deepEqual(chamadasBrevo[0].listIds, [12]);
});

test('método diferente de POST ⇒ 405', async () => {
  const res = await chamar(pedido({ method: 'GET' }));
  assert.equal(res.statusCode, 405);
});

test('sem Origin ⇒ 403 e não chama o Brevo', async () => {
  const res = await chamar(pedido({ body: { email: 'a@b.com' }, origin: null }));
  assert.equal(res.statusCode, 403);
  assert.equal(chamadasBrevo.length, 0);
});

test('Origin de outro site ⇒ 403 e não chama o Brevo', async () => {
  const res = await chamar(pedido({ body: { email: 'a@b.com' }, origin: 'https://site-malicioso.com' }));
  assert.equal(res.statusCode, 403);
  assert.equal(chamadasBrevo.length, 0);
});

test('campo-isca preenchido ⇒ finge sucesso e não chama o Brevo', async () => {
  const res = await chamar(pedido({ body: { email: 'a@b.com', website: 'http://spam' } }));
  assert.equal(res.statusCode, 200);
  assert.equal(chamadasBrevo.length, 0);
});

test('e-mail inválido ⇒ 400', async () => {
  for (const email of ['', 'sem-arroba', 'a@b', 123, `${'a'.repeat(250)}@b.com`]) {
    const res = await chamar(pedido({ body: { email }, ip: `ip-${String(email).length}` }));
    assert.equal(res.statusCode, 400, `deveria recusar: ${String(email).slice(0, 20)}`);
  }
  assert.equal(chamadasBrevo.length, 0);
});

test('6º pedido do mesmo IP em 10 min ⇒ 429; outro IP continua livre', async () => {
  for (let i = 0; i < 5; i++) {
    const res = await chamar(pedido({ body: { email: `p${i}@x.com` }, ip: '9.9.9.9' }));
    assert.equal(res.statusCode, 200);
  }
  const bloqueado = await chamar(pedido({ body: { email: 'p6@x.com' }, ip: '9.9.9.9' }));
  assert.equal(bloqueado.statusCode, 429);
  const outro = await chamar(pedido({ body: { email: 'q@x.com' }, ip: '8.8.8.8' }));
  assert.equal(outro.statusCode, 200);
  assert.equal(chamadasBrevo.length, 6);
});

test('erro do Brevo ⇒ 500 com mensagem genérica', async () => {
  global.fetch = async () => ({ status: 400, json: async () => ({ code: 'invalid_parameter' }) });
  const erroOriginal = console.error;
  console.error = () => {};
  const res = await chamar(pedido({ body: { email: 'a@b.com' } }));
  console.error = erroOriginal;
  assert.equal(res.statusCode, 500);
  assert.equal(res.corpo.error, 'Erro ao cadastrar email');
});
