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

CI: só no robô mensal das taxas (roda `npm test` antes de publicar). Nas mudanças normais, os testes rodam no "Pode subir". A Vercel só publica se o build passar.

## O que bloqueia a publicação

`npm test` ou `npm run build` falhou ⇒ não publica (regra da skill `pode-subir`).

## Invariantes

| Invariante | Teste |
| --- | --- |
| Renda = patrimônio × taxa mensal; os modos se invertem entre si; IR regressivo; taxa real; erros | `tests/simulador.test.js` |
| Lista pública de investimentos com taxas válidas (PT e EN) | `tests/simulador.test.js` |
| Robô das taxas: leitura de SGS/Tesouro/Treasury/BLS e trava de faixa/salto | `tests/atualizar-taxas.test.js` |
| `api/subscribe.js`: e-mail inválido ⇒ 400; método ≠ POST ⇒ 405; `lang=en` ⇒ lista 12; origem de fora ⇒ 403; campo-isca; limite por IP ⇒ 429 | `tests/subscribe.test.js` |
| `dist/` não contém `docs/`, `scripts/`, `.env*`, `CLAUDE.md`, `AGENTS.md` | — |

## Fluxos manuais (conferir após mudanças grandes)

1. Home → cada uma das 4 perguntas → Calcular → o card vira → `/results` mostra frase, valores, card e gráfico.
2. Formulário de e-mail → mensagem de sucesso → contato aparece na lista do Brevo.
3. Página `/en/` → mesmo fluxo em inglês.

## Convenções

- Testes futuros com `node --test` (já vem no Node, sem dependência nova).
- Brevo com implementação falsa nos testes.
