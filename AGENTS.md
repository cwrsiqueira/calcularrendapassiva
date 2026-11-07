# Calculadora Renda Passiva

Site de simulação de renda passiva e independência financeira para brasileiros (e páginas em inglês para o público dos EUA), em https://calcularrendapassiva.com. Ganha dinheiro com AdSense e afiliados Hotmart, capta e-mails e leva visitantes para o app (Google Play / App Store). Persona principal: pessoa de 25–50 anos, no celular, que quer saber quanto precisa investir para viver de renda.

Estado atual e próximo passo: [docs/STATUS_PROJETO.md](docs/STATUS_PROJETO.md). Estratégia, checklist da máquina de vendas e decisões de negócio: [CLAUDE.md](CLAUDE.md) (fonte de verdade do dono).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | HTML + CSS + JavaScript puro (sem framework, sem React) |
| Backend | 1 Vercel Function: `api/subscribe.js` (Node, envia e-mail para o Brevo) |
| Banco | nenhum (o calculador roda no navegador; e-mails ficam no Brevo) |
| Build | Node: `scripts/build.js` (minifica para `dist/`), `scripts/paginas.js` (páginas programáticas) |
| Testes | nenhum automatizado ainda |
| Hospedagem | Vercel, deploy automático a cada push no `master` |
| Gerenciador de pacotes | npm — não trocar |

Não introduzir dependência nova sem justificar e pedir aprovação. Confirmar no registro que o pacote existe e é o oficial.

## Comandos

```bash
npm install
npm run build                                   # gera dist/ (é o que a Vercel roda)
python -m http.server 8765 -d dist             # ver o site local (sem a API)
npm run paginas                                 # regenera páginas programáticas, hubs e bloco GERADO do sitemap
node -e "new Function(require('fs').readFileSync('js/<arquivo>.js','utf8'))"   # checa sintaxe de um JS
```

Antes de qualquer commit: `npm run build` sem erro + checagem de sintaxe dos JS alterados. Não há lint, tipos nem testes automatizados.

## Leia antes de alterar

| Antes de mexer em | Leia |
| --- | --- |
| qualquer coisa (primeira vez) | [docs/padroes/01-PRINCIPIOS.md](docs/padroes/01-PRINCIPIOS.md) e [CLAUDE.md](CLAUDE.md) |
| `api/`, formulário de e-mail, dado pessoal, header, arquivo novo na raiz | [docs/SEGURANCA.md](docs/SEGURANCA.md) e [docs/padroes/02-SEGURANCA.md](docs/padroes/02-SEGURANCA.md) |
| detalhes da stack | [docs/padroes/03-SEGURANCA-POR-STACK.md](docs/padroes/03-SEGURANCA-POR-STACK.md) (seção "PHP puro / site estático" e "Integrações comuns") |
| endpoint, integração | [docs/padroes/04-API.md](docs/padroes/04-API.md) |
| tela, componente, texto da interface, anúncio | [docs/DESIGN.md](docs/DESIGN.md) e [docs/padroes/06-UI-UX.md](docs/padroes/06-UI-UX.md) |
| testes | [docs/TESTES.md](docs/TESTES.md) e [docs/padroes/07-TESTES.md](docs/padroes/07-TESTES.md) |
| cálculo, taxas, regra de negócio | [docs/DOMINIO.md](docs/DOMINIO.md) |
| publicar, Vercel, variáveis de ambiente | [docs/DEPLOY.md](docs/DEPLOY.md) |
| por que algo é assim | [docs/DECISOES.md](docs/DECISOES.md) |
| forma de trabalhar, git, rituais | [docs/padroes/08-TRABALHO-COM-IA.md](docs/padroes/08-TRABALHO-COM-IA.md) |

## Regras invioláveis

1. **Só HTML/CSS/JS puro** no site — nada de framework com renderização no cliente (o Lovable/React derrubou o SEO).
2. **O servidor decide.** `api/subscribe.js` valida tudo que chega; a lista do Brevo nunca vem do cliente como número.
3. **Nenhum segredo no cliente, no Git, nos docs, nos logs ou em comandos.** `BREVO_API_KEY` só existe na Vercel e no `.env.local`. Conferir `.env*` só pelos nomes.
4. **Nada privado vai para `dist/`.** `scripts/build.js` copia tudo da raiz que não estiver em `EXCLUDED`: arquivo ou pasta nova que não seja página do site entra nessa lista (e no `.vercelignore`).
5. **AdSense: exatamente 4 blocos por página** (topo, Footer CRP, laterais LE/LD via `js/ads.js`, laterais só em telas ≥ 1100px). Não adicionar outros.
6. **Afiliados Hotmart só em `js/afiliados.js`** (fonte única).
7. **Cache:** `.js`/`.css` são `immutable` — ao alterar um, subir o `?v=AAAAMMDD` em todas as referências dos HTML.
8. **Páginas programáticas são geradas:** não editar à mão os HTML que `scripts/paginas.js` / `scripts/paginas-en.js` produzem; mudar template ou `scripts/taxas.json` e rodar `npm run paginas`.
9. **Preço do PRO é R$19,90, pagamento único** — não questionar. Não pular fases do checklist do `CLAUDE.md`.

## Pare e pergunte quando

- a regra de cálculo não está em `docs/DOMINIO.md` ou é ambígua;
- a mudança mexe em URL existente, canonical, redirect do `vercel.json` ou sitemap (risco de perder indexação);
- a ação é irreversível ou toca produção, a lista de e-mails do Brevo ou mensagem a assinante real;
- for preciso criar arquivo novo na raiz (ver regra 4).

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `index.html`, `results.html`, `en/` | calculadora PT, resultado, versão EN |
| `artigos/`, `articles/`, `en/articles/` | artigos manuais + páginas programáticas |
| `js/` | `calculadora.js` (cálculo + GA4), `sections.js`, `email.js`, `afiliados.js`, `ads.js`, `header-card.js` |
| `css/` | estilos |
| `api/` | Vercel Function `subscribe.js` |
| `scripts/` | build, geradores de páginas, `taxas.json`, `template.js` |
| `docs/` | docs de contexto, padrões, e-mails do funil (não publicado) |

## Conduzir a pessoa

Ao terminar cada tarefa, diga em uma linha o próximo passo e a frase que a pessoa deve usar (ex.: "Para salvar e publicar, diga **Pode subir**"). Antes de qualquer ação com efeito fora do computador (commit, push, deploy, apagar), explique em uma frase e pergunte com resposta **sim** ou **não**.

## Frases de comando

"Me atualize", "Revise a segurança", "Pode subir", "Encerre a sessão" e "Audite o contexto" seguem as skills em `.claude/skills/` (mesmo conteúdo em `.cursor/skills/`). Em ferramenta sem skills, leia o `SKILL.md` correspondente e siga.

## Git e publicação

- Commit e push só com "Pode subir" (skill `pode-subir`). Sem force push, sem `--no-verify`.
- Branch única: `master`. Push = deploy na Vercel.
- Mensagem de commit: prefixo curto (`SEO:`, `Fix:`, `Docs:`, `Afiliados:`…) + resumo em português.
- Ao terminar uma mudança, atualizar `docs/STATUS_PROJETO.md` (e o `CLAUDE.md` se mudou etapa do checklist ou decisão).

## Idioma

Docs, interface PT, mensagens e commits em português do Brasil. Páginas em `/en` em inglês dos EUA.
