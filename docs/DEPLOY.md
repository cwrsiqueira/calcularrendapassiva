# Deploy

## Onde roda

| Ambiente | Onde | URL | Como publica |
| --- | --- | --- | --- |
| Produção | Vercel | https://calcularrendapassiva.com | push no `master` → Vercel roda `npm install && npm run build` → publica `dist/` + `api/` |
| Dev | local | `http://localhost:8765` | `npm run build` e `npm run local` (links sem .html como na Vercel; a API não roda assim; para ela, `vercel dev`) |

`www.` redireciona para o domínio sem `www` (`vercel.json`).

## Variáveis de ambiente

Só os **nomes**. Valores ficam na Vercel e no `.env.local` (fora do Git), nunca aqui.

| Nome | Para que serve | Pública? |
| --- | --- | --- |
| `BREVO_API_KEY` | chave da API do Brevo, usada por `api/subscribe.js` | não |
| `BREVO_LIST_ID` | lista PT (padrão 11) | não |
| `BREVO_LIST_ID_EN` | lista EN (padrão 12) | não |

Gravar um valor: painel da Vercel → Project → Settings → Environment Variables. Nunca `CHAVE=valor` na linha de comando.

IDs públicos que ficam no HTML de propósito (não são segredo): GA4 `G-V1JD0D4KM1`, cliente e slots do AdSense, chave IndexNow (`98b4a40f84f382c9360e38a2bf94e1be.txt`).

## Publicar

1. "Pode subir" (build sem erro, `?v=` atualizado se mudou `.js`/`.css`, commit, push no `master`).
2. A Vercel faz o build e publica em alguns minutos.
3. Depois de `npm run paginas`: reenviar URLs ao IndexNow (POST em `api.indexnow.org/indexnow`) e, se houver páginas novas, pedir indexação no Search Console.

## Conferir depois de publicar

- [ ] https://calcularrendapassiva.com responde 200
- [ ] Calculadora gera resultado e abre `/results`
- [ ] Formulário de e-mail cadastra (teste com e-mail próprio)
- [ ] Headers de segurança presentes (`curl -I https://calcularrendapassiva.com`)
- [ ] `/.env`, `/.git/config`, `/CLAUDE.md`, `/AGENTS.md`, `/docs/...` respondem 404

## Voltar versão (rollback)

Painel da Vercel → Deployments → escolher o deploy anterior → "Promote to Production". Depois, `git revert` do commit problemático e "Pode subir".

## Rotacionar uma chave

1. Gerar a nova no Brevo (SMTP & API → API Keys).
2. Gravar na Vercel e no `.env.local`.
3. Redeploy.
4. Revogar a antiga no Brevo.
5. Registrar a data em `docs/SEGURANCA.md`.

## Backup

- Código: GitHub (`cwrsiqueira/calcularrendapassiva`). Contatos: ficam no Brevo (exportar CSV de vez em quando).
- Última restauração testada: nunca.
