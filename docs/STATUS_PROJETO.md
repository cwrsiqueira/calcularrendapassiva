# Status do projeto

Última atualização: 2026-11-06

<!-- Curto e datado. O git manda: se este arquivo divergir do git, o git está certo. Detalhe estratégico no CLAUDE.md. -->

## Onde estamos

- Em produção: sim — https://calcularrendapassiva.com — último deploy de código: `fac0cf0` (SEO EN, out/2026)
- Fase atual: máquina de vendas — Fases 1 e 2 concluídas (falta 2.4 pixel Meta); Fase 3 (conteúdo SEO) em andamento. Ver checklist no `CLAUDE.md`.

## Feito recentemente

- 2026-11-07: layout claro no site todo; calculadora nova (4 perguntas, 7 investimentos + personalizado, IR e inflação opcionais, aviso de simulação); resultado e card de compartilhar novos; planilha/afiliados/app movidos para o resultado. Motor em `js/simulador.js` com testes.
- 2026-11-06: `/api/subscribe` protegido contra robôs (origem, campo-isca, limite por IP, tamanho) com 9 testes (`npm test`).
- 2026-11-06: kit de contexto para IA instalado (`AGENTS.md`, `docs/`, `docs/padroes/`, skills).
- Out/2026: home EN focada em "passive income calculator"; afiliados Hotmart recolocados; 34 páginas EN + 10 PT; eventos GA4; IndexNow.

## Pendências

| Prioridade | Item | Depende de |
| --- | --- | --- |
| P1 | Concluir "Etapas para receber pagamentos" no AdSense | Carlos |
| P2 | 2.4 Pixel do Meta | ID do pixel (Carlos) |
| P2 | Despublicar `calcularrendapassiva.lovable.app`; importar site no Bing Webmaster | Carlos |
| P3 | Aviso LGPD no formulário; headers de segurança | nada |
| P2 | Automação mensal das taxas (GitHub Actions + API do Banco Central + Focus + Tesouro Transparente) | nada — parte 2 do plano |
| P3 | Reescrever "Como usar a calculadora" (PT e EN) para o método novo | nada |
| P3 | Conferir `tesouroIpcaReal` (7,5% é estimativa) e os yields de FII/ações | Carlos |
| P3 | Fase 3: artigos 3.1–3.3 e landing `/app` | nada |

## Próximo passo

Publicar o layout novo, acompanhar 2–3 semanas (GA4: `resultado_gerado` por `modo`/`produto`; Search Console da home) e fazer a automação mensal das taxas.

## Decisões em aberto

- Nenhuma no momento.
