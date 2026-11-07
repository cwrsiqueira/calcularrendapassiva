# Segurança — Calculadora Renda Passiva

Como este projeto cumpre o [baseline comum](padroes/02-SEGURANCA.md). Regra comum não se repete aqui: aqui fica o **como**, o **onde** e o que **falta**.

Última revisão: 2026-11-06 (adoção do kit de contexto)

## Modelo de ameaças

| Ator | Pode | Não pode |
| --- | --- | --- |
| Visitante anônimo | ver páginas, usar a calculadora, enviar e-mail no formulário | ver arquivos internos (`docs/`, `scripts/`, `.env*`), escolher a lista do Brevo |
| Robô / abusador | chamar `POST /api/subscribe` | cadastrar e-mails em massa (barrado por origem, campo-isca e limite por IP — ver lacunas) |
| Brevo, Google (AdSense/GA4), Hotmart | receber dados que o site envia | — |

Ativos: chave do Brevo, lista de e-mails, reputação do remetente no Brevo, conta AdSense, ranking no Google.

Dados pessoais guardados: só e-mail, no Brevo — finalidade: entregar a planilha e a sequência de e-mails — retenção: até o descadastro.

## Rotas públicas (sem login)

O site não tem login: tudo é público.

| Rota | Por que é pública | Proteções |
| --- | --- | --- |
| páginas estáticas | é o site | só o que `scripts/build.js` copia para `dist/` |
| `POST /api/subscribe` | captura de e-mail | só POST, Origin igual ao host, campo-isca `website`, 5 pedidos/10 min por IP, e-mail ≤ 254 chars, lista decidida no servidor, erro genérico |

## Como cumprimos o baseline

| Item | Situação | Onde |
| --- | --- | --- |
| Autorização por recurso | não se aplica | sem login |
| Validação no servidor | sim | `api/subscribe.js` (tipo, tamanho ≤ 254, formato) |
| Campos de gravação em allowlist | sim | `api/subscribe.js` envia só `email` e `listIds` |
| Segredos fora do cliente e do Git | sim | `BREVO_API_KEY` só no servidor; `.env.local` ignorado |
| Arquivos internos fora do site publicado | sim | `EXCLUDED` em `scripts/build.js` + `.vercelignore` (lista de exclusão: arquivo novo na raiz precisa entrar nela) |
| Headers (CSP, HSTS, nosniff, frame-ancestors) | parcial | só HSTS (padrão da Vercel); `vercel.json` não define os outros |
| Erro genérico / debug desligado | sim | `api/subscribe.js` |
| Rate limit em entradas públicas | parcial | `api/subscribe.js`: 5/10 min por IP, na memória da instância (não é global entre instâncias da Vercel) |
| Log de segurança sem dado sensível | sim | loga só status/erro do Brevo |
| Dependências: lockfile + audit | parcial | `package-lock.json`; `npm audit` = 0 vulnerabilidades (2026-11-06); sem CI |
| LGPD: termos, exclusão, retenção | parcial | página de termos existe; formulário não avisa a finalidade nem linka a política |

## Lacunas conhecidas (backlog)

| Prioridade | Item | Risco |
| --- | --- | --- |
| P3 | Limite por IP do `/api/subscribe` é por instância; robô que forja `Origin` e troca de IP ainda passa | se o abuso aparecer: Cloudflare Turnstile ou confirmação dupla (double opt-in) no Brevo |
| P3 | Formulário sem aviso de finalidade/política (LGPD) | exigência legal de transparência na coleta |
| P3 | Headers de segurança ausentes (nosniff, frame-ancestors, Referrer-Policy) | site pode ser embutido em outro (clickjacking) |

## Testes de abuso existentes

- `tests/subscribe.test.js`: sem Origin / Origin de outro site ⇒ 403; campo-isca ⇒ sucesso falso sem chamar o Brevo; 6º pedido do mesmo IP ⇒ 429; e-mail inválido ou longo ⇒ 400.

## Incidentes

Nenhum registrado. Formato em [padroes/checklists/INCIDENTE.md](padroes/checklists/INCIDENTE.md).
