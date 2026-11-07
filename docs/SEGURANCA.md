# Segurança — Calculadora Renda Passiva

Como este projeto cumpre o [baseline comum](padroes/02-SEGURANCA.md). Regra comum não se repete aqui: aqui fica o **como**, o **onde** e o que **falta**.

Última revisão: 2026-11-06 (adoção do kit de contexto)

## Modelo de ameaças

| Ator | Pode | Não pode |
| --- | --- | --- |
| Visitante anônimo | ver páginas, usar a calculadora, enviar e-mail no formulário | ver arquivos internos (`docs/`, `scripts/`, `.env*`), escolher a lista do Brevo |
| Robô / abusador | chamar `POST /api/subscribe` | cadastrar e-mails em massa (hoje **pode**: sem limite — ver lacunas) |
| Brevo, Google (AdSense/GA4), Hotmart | receber dados que o site envia | — |

Ativos: chave do Brevo, lista de e-mails, reputação do remetente no Brevo, conta AdSense, ranking no Google.

Dados pessoais guardados: só e-mail, no Brevo — finalidade: entregar a planilha e a sequência de e-mails — retenção: até o descadastro.

## Rotas públicas (sem login)

O site não tem login: tudo é público.

| Rota | Por que é pública | Proteções |
| --- | --- | --- |
| páginas estáticas | é o site | só o que `scripts/build.js` copia para `dist/` |
| `POST /api/subscribe` | captura de e-mail | só POST, regex de e-mail, lista decidida no servidor, erro genérico; **sem** rate limit |

## Como cumprimos o baseline

| Item | Situação | Onde |
| --- | --- | --- |
| Autorização por recurso | não se aplica | sem login |
| Validação no servidor | parcial | `api/subscribe.js` (regex; sem limite de tamanho) |
| Campos de gravação em allowlist | sim | `api/subscribe.js` envia só `email` e `listIds` |
| Segredos fora do cliente e do Git | sim | `BREVO_API_KEY` só no servidor; `.env.local` ignorado |
| Arquivos internos fora do site publicado | sim | `EXCLUDED` em `scripts/build.js` + `.vercelignore` (lista de exclusão: arquivo novo na raiz precisa entrar nela) |
| Headers (CSP, HSTS, nosniff, frame-ancestors) | parcial | só HSTS (padrão da Vercel); `vercel.json` não define os outros |
| Erro genérico / debug desligado | sim | `api/subscribe.js` |
| Rate limit em entradas públicas | não | `api/subscribe.js` |
| Log de segurança sem dado sensível | sim | loga só status/erro do Brevo |
| Dependências: lockfile + audit | parcial | `package-lock.json`; `npm audit` = 0 vulnerabilidades (2026-11-06); sem CI |
| LGPD: termos, exclusão, retenção | parcial | página de termos existe; formulário não avisa a finalidade nem linka a política |

## Lacunas conhecidas (backlog)

| Prioridade | Item | Risco |
| --- | --- | --- |
| P2 | `POST /api/subscribe` sem rate limit nem anti-robô | alguém cadastra milhares de e-mails de terceiros; Brevo manda e-mail para quem não pediu, gasta a cota e pode bloquear a conta |
| P3 | Formulário sem aviso de finalidade/política (LGPD) | exigência legal de transparência na coleta |
| P3 | Headers de segurança ausentes (nosniff, frame-ancestors, Referrer-Policy) | site pode ser embutido em outro (clickjacking) |
| P3 | Sem limite de tamanho do e-mail na API | entrada enorme vai até o Brevo |

## Testes de abuso existentes

Nenhum.

## Incidentes

Nenhum registrado. Formato em [padroes/checklists/INCIDENTE.md](padroes/checklists/INCIDENTE.md).
