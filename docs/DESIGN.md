# Design — Calculadora Renda Passiva

Princípios comuns em [padroes/06-UI-UX.md](padroes/06-UI-UX.md). Aqui só o que é deste projeto.

## Persona

Rafael, 34 anos, analista CLT, pesquisa no Google pelo celular no intervalo do almoço ("quanto rende 100 mil por mês"). Quer, em 2 minutos, saber quanto precisa juntar para viver de renda e onde investir.

## Tokens (`css/style.css`, `:root`) — tema claro desde 07/11/2026

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#eef1f5` | página (cinza-gelo, nunca branco puro) |
| `--surface` | `#f9fafb` | cards |
| `--surface-2` | `#f1f4f8` | chips, opções, fundos internos |
| `--border` / `--border-strong` | `#dde2e9` / `#c5cdd8` | bordas, campos |
| `--text` | `#1b2230` | títulos e corpo |
| `--text-muted` / `--text-soft` | `#4b5565` / `#6b7585` | textos de apoio, legendas |
| `--primary` | `#6a2fd6` | botão principal, destaque, valor do resultado |
| `--accent` | `#c026d3` | gradiente do ícone e do card de compartilhar |
| `--error` | `#b42318` | erros |

Fonte: Inter. Conteúdo: 42rem; home e resultado em duas colunas (até 58rem) entre 992–1099px e a partir de 1280px (entre 1100–1279px os anúncios laterais ocupam as bordas).

## Telas

### Home (`index.html`, `en/index.html`)

- Objetivo: simular a renda passiva.
- Ação principal: escolher a pergunta, o investimento, preencher 2–3 campos e **Calcular** (o card vira e abre o resultado).
- Ao lado (telas largas) ou abaixo: acesso rápido. Depois: Footer CRP, blog e perguntas frequentes recolhidas (texto SEO).

### Resultado (`results.html`)

- Objetivo: mostrar o resultado (frase + número grande + detalhes + aviso), o card para compartilhar (WhatsApp/imagem) e o gráfico.
- Depois: planilha grátis (e-mail), afiliados e app (PT), Footer CRP e acesso rápido.

### Artigos e páginas programáticas

- Template em `scripts/template.js`; 4 blocos de AdSense; bloco "Para Ir Além" (afiliados) antes do Footer CRP.

## Palavras do usuário

| Usamos | Não usamos |
| --- | --- |
| renda passiva, viver de renda | fluxo de caixa passivo |
| quanto investir por mês | aporte periódico (só como apoio) |
| planilha grátis | lead magnet, isca |
