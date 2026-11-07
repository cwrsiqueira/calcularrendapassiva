---
name: pode-subir
description: Publica as alterações do site Calculadora Renda Passiva — build, atualização do CLAUDE.md, commit e push para master (a Vercel faz o deploy). Use quando o usuário disser "Pode subir", "sobe aí", "pode commitar" ou pedir para publicar/subir as mudanças.
---

# Pode subir

Sequência obrigatória para publicar o site. Só executar com autorização explícita do usuário
("Pode subir" ou variação clara) — nunca fazer commit/push por conta própria.

Branch única: `master`. A Vercel faz o deploy automaticamente a cada push
(`buildCommand: npm install && npm run build`, saída em `dist/`).

## 1. Conferir o que vai subir

- `git status --short` e `git diff --stat`
- Arquivos não rastreados que não fazem parte da mudança (ex.: PDFs em `docs/`) **não** entram
  no commit — listar para o usuário no final.
- Nunca commitar `.env*`, `dist/`, `node_modules/`.

## 2. Build — portão de qualidade

- `npm run build` — **abortar tudo se falhar** e mostrar o erro ao usuário.
- Checar sintaxe dos JS alterados: `node -e "new Function(require('fs').readFileSync('<arquivo>','utf8'))"`.

## 3. Cache dos assets

O `vercel.json` serve `.js`/`.css` com `max-age=31536000, immutable`. Se algum arquivo em
`css/` ou `js/` mudou, atualizar o `?v=AAAAMMDD` das referências a ele em todos os HTML
(ex.: `/css/style.css?v=20261007`), senão visitantes recorrentes ficam com a versão antiga.
Arquivos novos não precisam disso.

## 4. Atualizar o CLAUDE.md

Se a mudança concluiu uma etapa do checklist ou alterou uma decisão/regra, atualizar o
`CLAUDE.md` (fonte de verdade do projeto) antes do commit.

## 5. Commit e push

- `git add` só dos arquivos da mudança (por caminho, não `git add -A`).
- Mensagem no padrão do repositório: prefixo curto (`Fix:`, `Docs:`, `Fase N:`…) + resumo
  em português.
- `git push origin master`

## 6. Relatório final

Informar: hash do commit, arquivos incluídos, arquivos deixados de fora e que a Vercel vai
publicar em alguns minutos.
