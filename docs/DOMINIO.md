# Domínio — regras de negócio

A IA não inventa regra. O que não está aqui como **fato confirmado** é perguntado ao dono antes de implementar.

Legenda: **[fato]** confirmado pelo dono · **[a confirmar]** encontrado no código ou suposto · **[decisão pendente]** precisa de resposta.

Decisões de negócio (monetização, preço do PRO, AdSense, afiliados) estão no [CLAUDE.md](../CLAUDE.md), escrito pelo dono, e valem como **[fato]**.

## Glossário

| Termo | Significa | Não confundir com |
| --- | --- | --- |
| Renda passiva | rendimento mensal do patrimônio acumulado, sem consumir o principal | salário, saque do patrimônio |
| Taxa | rentabilidade **mensal** em % (a anual é derivada) | taxa anual digitada pelo usuário |
| Aporte / valor recorrente | depósito mensal | valor inicial |
| Página programática | página gerada por `scripts/paginas*.js` a partir de `taxas.json` | artigo manual em `artigos/` |
| PRO | versão paga do app (R$19,90, única) | o site, que é grátis |

## Entidades e fonte da verdade

| Entidade | Fonte da verdade | Quem cria/altera |
| --- | --- | --- |
| Taxas de referência (Selic, CDI, poupança, IPCA, IR, yields) | `scripts/taxas.json` | dono, todo mês após Copom/IPCA |
| Links de afiliado | `js/afiliados.js` | dono |
| Assinantes de e-mail | Brevo, listas 11 (PT) e 12 (EN) | visitante pelo formulário; IA não mexe |
| Preço do PRO | lojas (Google Play / App Store) | dono |

## Regras

### Calculadora (`js/calculadora.js`)

1. **[fato]** O usuário preenche 4 dos 5 campos (prazo, valor inicial, aporte mensal, taxa mensal, renda desejada) e deixa **exatamente um** em branco; a calculadora descobre o que falta. Com zero ou mais de um em branco, mostra alerta. (`js/calculadora.js:228-238`)
2. **[fato]** Renda passiva = patrimônio acumulado × taxa mensal. O patrimônio necessário = renda ÷ taxa mensal. (`js/calculadora.js:253`, `:308`)
   - Exemplo: renda R$5.000 com taxa 1% a.m. ⇒ patrimônio de R$500.000.
3. **[fato]** Juros compostos mensais, com o aporte somado no **fim** de cada mês. (`js/calculadora.js:197`, `:256`)
4. **[fato]** Taxa anual ↔ mensal por equivalência composta: mensal = (1 + anual)^(1/12) − 1. (`js/calculadora.js:147`, `:153`)
5. **[fato]** A calculadora não desconta inflação nem imposto de renda: os valores são nominais e brutos.
6. **[fato]** Ao descobrir a taxa, procura de 0,01% em 0,01% a.m. até a renda ser atingida. (`js/calculadora.js:284-296`)

### Páginas programáticas (`scripts/paginas.js`, `scripts/taxas.json`)

7. **[fato]** CDB 100% do CDI e Tesouro Selic com IR de 15% (aplicações acima de 2 anos); poupança, LCI/LCA, FIIs e ações de dividendos isentos. LCI/LCA = 90% do CDI. (`scripts/paginas.js:39-48`)
8. **[fato]** FIIs (10% a.a.) e ações (7% a.a.) usam dividend yield médio estimado, com aviso de que não é garantia. (`scripts/taxas.json`, `scripts/paginas.js:61`)
9. **[fato]** Cenários de acumulação usam a taxa **real** (acima do IPCA) do CDB líquido. (`scripts/paginas.js:52`)
10. **[fato]** Taxas atualizadas todo mês após Copom/IPCA → `npm run paginas`. Artigos manuais são corrigidos à mão. (CLAUDE.md §8)

### Captura de e-mail (`api/subscribe.js`, `js/email.js`)

11. **[fato]** Visitante em `/en/...` vai para a lista 12 (EN); qualquer outro, para a lista 11 (PT). Quem já existe é atualizado sem erro. (`js/email.js:8`, `api/subscribe.js:13-15`)
12. **[fato]** A isca é a planilha (PT ou EN) entregue pelo e-mail 1 da sequência de 5 do Brevo. (CLAUDE.md §6, 2.1–2.3)

### Monetização (CLAUDE.md §5)

13. **[fato]** AdSense com exatamente 4 blocos por página; laterais só em telas ≥ 1100px.
14. **[fato]** Afiliados Hotmart só em `js/afiliados.js`; ordem por assunto da URL (Tesouro/CDB/poupança → Método IRM; FII/dividendos → planilha).
15. **[fato]** App PRO: R$19,90, pagamento único vitalício.

## Invariantes (sempre verdadeiros)

- Nada de `docs/`, `scripts/`, `.claude/`, `.env*` ou arquivo de contexto vai para `dist/`.
- Todo número de taxa exibido nas páginas geradas sai de `taxas.json`, com a data de referência na página.

## Fora de escopo

- O site não guarda dados do usuário (só `sessionStorage` do navegador) e não tem login.
- O site não vende o PRO: o pagamento é nas lojas.
- Não é recomendação de investimento: são simulações.

## Decisões pendentes

- Nenhuma. (2026-11-06: o dono decidiu que o resultado deve avisar que os valores não descontam inflação nem IR — a implementar.)
