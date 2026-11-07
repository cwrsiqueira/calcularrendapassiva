# Decisões

Registro curto do porquê das escolhas. Decisão nova no topo. Não apague as antigas: marque como substituídas. O histórico estratégico completo está no [CLAUDE.md](../CLAUDE.md) (seções 5 e 10).

## 2026-11-07 — Site self-service para taxas

- **Contexto:** algumas taxas não têm fonte oficial automática (FII/ações, poupança/CD/ETF dos EUA) e uma fonte pode falhar.
- **Decisão:** o dono não revisa nem recebe avisos. Toda taxa tem data; se não for atualizada, o site usa a anterior e a calculadora mostra a data e sugere ao visitante ajustar a taxa (campo sempre visível e editável, mantendo o IR do investimento). O robô não abre issue.
- **Alternativas descartadas:** lembrete trimestral/por variação para o dono revisar; esconder o campo de taxa atrás de "Ajustar taxa".
- **Status:** vigente

## 2026-11-07 — Layout novo e calculadora por pergunta

- **Contexto:** queda de visitas e calculadora difícil de usar ("deixe um campo em branco", taxa digitada à mão).
- **Decisão:** tema claro (fundo `#eef1f5`, sem branco puro) no site inteiro; home só com calculadora (virada mantida), acesso rápido, blog e perguntas frequentes recolhidas (texto SEO mantido na página); planilha, afiliados e app foram para a página de resultado; calculadora por pergunta ("O que você quer descobrir?") com lista de investimentos, IR regressivo e "valores de hoje" opcionais; aviso de que não é recomendação nem garantia.
- **Alternativas descartadas:** remover o texto SEO da home (97% dos cliques vêm dela); manter os 5 campos com um em branco.
- **Consequências:** taxas da calculadora vêm de `/dados/taxas.json` (gerado no build a partir de `scripts/taxas.json`); próxima etapa: automação mensal das taxas (GitHub Actions, publica sozinha com trava de faixa).
- **Status:** vigente

## 2026-11-06 — Kit de contexto para IA

- **Contexto:** o projeto tinha só o `CLAUDE.md` (estratégia), sem regras comuns para outras IAs.
- **Decisão:** `AGENTS.md` com as regras técnicas; `CLAUDE.md` continua sendo a fonte de verdade estratégica e importa o `AGENTS.md`.
- **Status:** vigente

## 2026-10-15 — Anúncios responsivos e restauração das páginas do Lovable

- **Contexto:** queda de 8k para 2k visitas e RPM de US$0,14.
- **Decisão:** blocos AdSense responsivos; 22 artigos restaurados nas URLs originais; páginas programáticas geradas de `taxas.json`.
- **Status:** vigente

## 2026-10-07 — 4 blocos de AdSense por página

- **Decisão:** topo, Footer CRP e laterais LE/LD (só ≥ 1100px), via `js/ads.js`.
- **Alternativas descartadas:** remover o AdSense (decisão de maio/2026, substituída).
- **Status:** vigente

## 2026-05-13 — Site em HTML/CSS/JS puro

- **Contexto:** a versão Lovable (React, renderizada no navegador) derrubou o SEO.
- **Decisão:** HTML puro, gerado/minificado por scripts Node.
- **Alternativas descartadas:** React/Lovable (invisível para robôs de busca).
- **Status:** vigente

## 2026-05-13 — PRO do app a R$19,90, pagamento único

- **Contexto:** uso episódico; R$12,99 sinalizava produto barato.
- **Decisão:** pagamento único de R$19,90.
- **Alternativas descartadas:** assinatura.
- **Status:** vigente
