# Design — Calculadora Renda Passiva

Princípios comuns em [padroes/06-UI-UX.md](padroes/06-UI-UX.md). Aqui só o que é deste projeto.

## Persona

Rafael, 34 anos, analista CLT, pesquisa no Google pelo celular no intervalo do almoço ("quanto rende 100 mil por mês"). Quer, em 2 minutos, saber quanto precisa juntar para viver de renda e onde investir.

## Tokens (`css/style.css`, `:root`)

| Token | Valor | Uso |
| --- | --- | --- |
| `--primary` | `#7d38f0` | botão principal, destaque |
| `--accent` | `#e847eb` | ícones, detalhes |
| `--text` | `#f8fafc` | títulos e corpo |
| `--text-muted` | `rgba(248,250,252,.8)` | legendas |
| `--bg` | `#030711` | página (tema escuro) |
| `--surface` | `rgba(255,255,255,.05)` | cards |
| `--border` | `rgba(255,255,255,.125)` | bordas |

Fonte: Inter. Largura do conteúdo: `--content-max` (37.5rem). Raio: 0.5rem.

## Telas

### Home (`index.html`, `en/index.html`)

- Objetivo: simular a renda passiva.
- Ação principal: preencher 4 campos e **Calcular**.
- Depois da calculadora: texto de apoio SEO, app, planilha grátis (e-mail), afiliados, artigos.

### Resultado (`results.html`)

- Objetivo: mostrar o resultado e o gráfico; compartilhar (card/WhatsApp); levar ao app.

### Artigos e páginas programáticas

- Template em `scripts/template.js`; 4 blocos de AdSense; bloco "Para Ir Além" (afiliados) antes do Footer CRP.

## Palavras do usuário

| Usamos | Não usamos |
| --- | --- |
| renda passiva, viver de renda | fluxo de caixa passivo |
| quanto investir por mês | aporte periódico (só como apoio) |
| planilha grátis | lead magnet, isca |
