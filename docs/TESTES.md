# Testes — Calculadora Renda Passiva

Estratégia comum em [padroes/07-TESTES.md](padroes/07-TESTES.md). Aqui: comandos, invariantes e o que bloqueia a publicação.

## Comandos

```bash
npm test                                                             # todos os testes
node --test tests/subscribe.test.js                                  # um arquivo
node --test --test-name-pattern="429" tests/*.test.js                # um teste pelo nome
npm run build                                                        # portão principal
node -e "new Function(require('fs').readFileSync('js/<arquivo>.js','utf8'))"   # sintaxe de um JS
```

Não há CI: os testes rodam no "Pode subir". A Vercel só publica se o build passar.

## O que bloqueia a publicação

`npm test` ou `npm run build` falhou ⇒ não publica (regra da skill `pode-subir`).

## Invariantes

| Invariante | Teste |
| --- | --- |
| Renda = patrimônio × taxa mensal; os 5 modos da calculadora se invertem entre si | — (candidato: extrair o cálculo de `js/calculadora.js` para função pura) |
| `api/subscribe.js`: e-mail inválido ⇒ 400; método ≠ POST ⇒ 405; `lang=en` ⇒ lista 12; origem de fora ⇒ 403; campo-isca; limite por IP ⇒ 429 | `tests/subscribe.test.js` |
| `dist/` não contém `docs/`, `scripts/`, `.env*`, `CLAUDE.md`, `AGENTS.md` | — |

## Fluxos manuais (conferir após mudanças grandes)

1. Home → preencher 4 campos → Calcular → `/results` mostra os valores.
2. Formulário de e-mail → mensagem de sucesso → contato aparece na lista do Brevo.
3. Página `/en/` → mesmo fluxo em inglês.

## Convenções

- Testes futuros com `node --test` (já vem no Node, sem dependência nova).
- Brevo com implementação falsa nos testes.
