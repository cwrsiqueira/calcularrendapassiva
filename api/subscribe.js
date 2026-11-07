// Cadastro de e-mail no Brevo (listas 11 PT / 12 EN).
// Proteções contra robôs: origem do próprio site, campo-isca, limite por IP e tamanho do e-mail.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX = 254;

// Limite por IP. Fica na memória da instância: não é global entre instâncias da Vercel,
// mas barra a rajada de um mesmo robô (as requisições seguidas caem na mesma instância).
const LIMITE = 5;
const JANELA_MS = 10 * 60 * 1000;
const MAX_IPS = 5000;
const tentativas = new Map(); // ip -> [timestamps]

function excedeuLimite(ip, agora) {
  const recentes = (tentativas.get(ip) || []).filter(t => agora - t < JANELA_MS);
  if (recentes.length >= LIMITE) {
    tentativas.set(ip, recentes);
    return true;
  }
  recentes.push(agora);
  if (!tentativas.has(ip) && tentativas.size >= MAX_IPS) {
    tentativas.delete(tentativas.keys().next().value); // descarta o IP mais antigo
  }
  tentativas.set(ip, recentes);
  return false;
}

function ipDe(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || 'desconhecido';
}

// Aceita só pedidos feitos de uma página do mesmo domínio que recebeu o pedido
// (produção, previews da Vercel e vercel dev).
function origemValida(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === String(host).split(',')[0].trim();
  } catch {
    return false;
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const en = body.lang === 'en';
  const msg = (pt, eng) => (en ? eng : pt);

  if (!origemValida(req)) {
    return res.status(403).json({ error: msg('Origem não permitida', 'Origin not allowed') });
  }

  // Campo-isca: invisível para pessoas. Preenchido = robô. Responde sucesso sem cadastrar.
  if (body.website) {
    return res.status(200).json({ success: true });
  }

  if (excedeuLimite(ipDe(req), Date.now())) {
    return res.status(429).json({
      error: msg('Muitas tentativas. Tente de novo em alguns minutos.', 'Too many attempts. Please try again in a few minutes.'),
    });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: msg('Email inválido', 'Invalid email') });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = en
    ? parseInt(process.env.BREVO_LIST_ID_EN || '12', 10)
    : parseInt(process.env.BREVO_LIST_ID || '11', 10);

  if (!apiKey) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    // 201 = criado, 204 = já existia (updateEnabled atualiza silenciosamente)
    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json().catch(() => ({}));
    console.error('Brevo error:', response.status, data);
    return res.status(500).json({ error: msg('Erro ao cadastrar email', 'Could not subscribe') });
  } catch (err) {
    console.error('Subscribe handler error:', err);
    return res.status(500).json({ error: msg('Erro interno', 'Internal error') });
  }
}

module.exports = handler;
module.exports._limparLimite = () => tentativas.clear(); // usado só pelos testes
