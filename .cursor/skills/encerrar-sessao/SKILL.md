---
name: encerrar-sessao
description: Encerra a sessão de trabalho. Atualiza o STATUS e os docs tocados, confere links e segredos nos docs e entrega o relatório do que foi feito. Use quando o usuário disser "Encerre a sessão", "atualize os docs e me dê o relatório" ou equivalente.
---

# Encerrar sessão

## 1. Levantar o que mudou

- `git status -sb` e `git log --since=<início da sessão> --oneline`.
- Junte com o que foi feito e decidido na conversa.

## 2. Atualizar os docs

- `docs/STATUS_PROJETO.md`: onde estamos, pendências, próximo passo, data.
- `docs/DECISOES.md`: cada decisão tomada na sessão.
- `docs/DOMINIO.md`: regra confirmada pelo dono vira **[fato]**; dúvida nova vira **[decisão pendente]**.
- `docs/SEGURANCA.md`: lacuna resolvida ou descoberta.
- `docs/DEPLOY.md`: se a forma de publicar ou o estado de produção mudou.

## 3. Conferir

Rode as seções 2 (links) e 5 (segredos) da skill `auditar-contexto` nos arquivos alterados.

## 4. Relatório

- O que foi feito, em linguagem simples.
- O que ficou pendente e o próximo passo.
- Commits feitos e o que ainda não foi commitado. Commit só se o usuário pedir ("Pode subir").
- Nada de segredo, senha ou conteúdo de `.env`.
