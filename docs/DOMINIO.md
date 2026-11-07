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
| Taxas de referência (Selic, CDI, poupança, IPCA, IR, yields, Tesouro IPCA+, custódia) | `scripts/taxas.json` → build gera `/dados/taxas.json` (lido pela calculadora) | robô mensal (`.github/workflows/atualizar-taxas.yml`, dia 12) grava valor + `atualizadoEm`; estimativas sem fonte automática ficam fixas com `revisadoEm` (o visitante ajusta na calculadora) |
| Links de afiliado | `js/afiliados.js` | dono |
| Assinantes de e-mail | Brevo, listas 11 (PT) e 12 (EN) | visitante pelo formulário; IA não mexe |
| Preço do PRO | lojas (Google Play / App Store) | dono |

## Regras

### Calculadora (cálculo em `js/simulador.js`, tela em `js/calculadora.js`) — refeita em 07/11/2026

1. **[fato]** A pessoa escolhe **o que quer descobrir** e só vê os campos daquela pergunta:
   - *Quanto investir por mês* (`aporte`): renda desejada + valor que já tem + prazo → aporte mensal;
   - *Em quanto tempo* (`prazo`): renda desejada + valor que já tem + aporte → prazo;
   - *Quanto vou ter* (`renda`): valor que já tem + aporte + prazo → patrimônio e renda;
   - *Quanto preciso juntar* (`patrimonio`): renda desejada → patrimônio necessário.
   A antiga regra "deixe um campo em branco" e a descoberta da taxa foram removidas (a taxa vem do investimento escolhido ou de "Outra rentabilidade").
2. **[fato]** Renda passiva = patrimônio × taxa mensal usada. O patrimônio necessário = renda ÷ taxa mensal usada.
   - Exemplo: renda R$5.000 com taxa 1% a.m. ⇒ patrimônio de R$500.000. Teste: `tests/simulador.test.js`.
3. **[fato]** Juros compostos mensais, com o aporte somado no **fim** de cada mês.
4. **[fato]** Taxa anual → mensal por equivalência composta: mensal = (1 + anual)^(1/12) − 1. Poupança usa a taxa mensal direto.
5. **[fato]** Investimentos (PT): CDB 100% do CDI, Tesouro Selic, LCI/LCA 90% do CDI, Tesouro IPCA+, poupança, FIIs, ações de dividendos e "Outra rentabilidade". Lista montada por `scripts/produtos.js` a partir de `taxas.json`; o build grava em `/dados/taxas.json`.
6. **[fato]** "Descontar imposto de renda" (ligado por padrão): IR regressivo na renda fixa tributada — 22,5% até 6 meses, 20% até 12, 17,5% até 24, 15% acima (no modo *Em quanto tempo*, recalcula com a alíquota do prazo encontrado; no *Quanto preciso juntar*, usa 15%). Tesouro desconta 0,20% a.a. de taxa da B3. Simplificação: o IR sai do rendimento de cada mês. EN: alíquota fixa estimada por produto (22% juros, 15% dividendos).
7. **[fato]** "Mostrar em valores de hoje" (desligado por padrão): usa a taxa real = (1 + taxa líquida) ÷ (1 + inflação mensal) − 1, com inflação = IPCA 12 meses (EN: CPI). Aportes e renda ficam no poder de compra de hoje.
8. **[fato]** Todo resultado e o card de compartilhar avisam: simulação educativa, taxas de referência do mês, **não é recomendação nem garantia de rentabilidade**. FIIs/ações/ETFs são marcados como estimativa média.
9. **[fato]** Meta acima de 100 anos ou taxa real ≤ 0 ⇒ mensagem de erro no formulário (sem `alert`).
   - **Taxa sempre visível e editável** (decisão de 07/11/2026): o campo "Rentabilidade" vem preenchido com a referência do investimento. Selo: verde "Atualizada em <data> · <fonte>" (taxa de mercado confirmada há até 45 dias); amarelo "pode estar desatualizada" (mais de 45 dias) ou "Estimativa média (<mês>)"; neutro "Média histórica" (S&P 500); roxo "sua própria taxa" + "Voltar para a referência" quando a pessoa digita outro valor. A taxa própria mantém as regras de IR e custódia do investimento. Resultado e card dizem "taxa informada por você" quando for o caso.

### Páginas programáticas (`scripts/paginas.js`, `scripts/taxas.json`)

10. **[fato]** CDB 100% do CDI e Tesouro Selic com IR de 15% (aplicações acima de 2 anos); poupança, LCI/LCA, FIIs e ações de dividendos isentos. LCI/LCA = 90% do CDI. (`scripts/paginas.js:39-48`)
11. **[fato]** FIIs (10% a.a.) e ações (7% a.a.) usam dividend yield médio estimado, com aviso de que não é garantia. (`scripts/taxas.json`, `scripts/paginas.js:61`)
12. **[fato]** Cenários de acumulação usam a taxa **real** (acima do IPCA) do CDB líquido. (`scripts/paginas.js:52`)
13. **[fato]** Taxas atualizadas todo mês por robô (dia 12): Selic, CDI, IPCA 12m, poupança, IPCA esperado (Focus), Tesouro IPCA+, T-bill e CPI. Trava: valor fora da faixa ou salto grande ⇒ nada publicado (o site segue com as taxas anteriores e mostra a data delas) (`scripts/atualizar-taxas.js`, testes em `tests/atualizar-taxas.test.js`). A calculadora usa o IPCA esperado (Focus) como inflação; as páginas geradas usam o IPCA 12 meses. Artigos manuais são corrigidos à mão.

### Captura de e-mail (`api/subscribe.js`, `js/email.js`)

14. **[fato]** Visitante em `/en/...` vai para a lista 12 (EN); qualquer outro, para a lista 11 (PT). Quem já existe é atualizado sem erro. (`js/email.js:8`, `api/subscribe.js:13-15`)
15. **[fato]** A isca é a planilha (PT ou EN) entregue pelo e-mail 1 da sequência de 5 do Brevo. (CLAUDE.md §6, 2.1–2.3)

### Monetização (CLAUDE.md §5)

16. **[fato]** AdSense com exatamente 4 blocos por página; laterais só em telas ≥ 1100px.
17. **[fato]** Afiliados Hotmart só em `js/afiliados.js`; ordem por assunto da URL (Tesouro/CDB/poupança → Método IRM; FII/dividendos → planilha).
18. **[fato]** App PRO: R$19,90, pagamento único vitalício.

## Invariantes (sempre verdadeiros)

- Nada de `docs/`, `scripts/`, `.claude/`, `.env*` ou arquivo de contexto vai para `dist/`.
- Todo número de taxa exibido nas páginas geradas sai de `taxas.json`, com a data de referência na página.

## Fora de escopo

- O site não guarda dados do usuário (só `sessionStorage` do navegador) e não tem login.
- O site não vende o PRO: o pagamento é nas lojas.
- Não é recomendação de investimento: são simulações.

## Decisões pendentes

- Nenhuma. (O aviso de 06/11/2026 foi implementado em 07/11/2026: a calculadora agora desconta IR e inflação opcionalmente e avisa no resultado.)
