# CLAUDE.md — Projeto: Máquina de Vendas | Calculadora Renda Passiva

> Este arquivo contém todo o contexto do planejamento estratégico desenvolvido em sessão anterior.
> Leia integralmente antes de qualquer ação. É a fonte de verdade do projeto.

---

## 1. Quem é o dono do projeto

- **Nome:** Carlos Wagner (Carlos Dev)
- **Localização:** Macapá, Amapá, BR
- **Perfil:** Desenvolvedor indie, criador de múltiplos produtos digitais, objetivo de montar uma
  carteira de produtos gerando renda passiva em paralelo.
- **GitHub:** https://github.com/cwrsiqueira
- **LinkedIn:** https://www.linkedin.com/in/carloswagner1975/
- **YouTube:** https://www.youtube.com/@carlosjornadadev
- **Site pessoal:** https://carlosdev.com.br

---

## 2. O produto em foco: Calculadora Renda Passiva

### Status atual
- **Produto validado** — não precisa de validação do zero.
- 500+ downloads no Google Play
- 5,0 estrelas (8 avaliações) no Google Play
- 8.000 visitas orgânicas comprovadas (pico histórico com site HTML puro anterior)
- Atualmente ~2.000 visitas/mês (queda após migração para Lovable/React)
- 6 atualizações do app em ~2 meses — sinal positivo para ASO

### Links do produto
| Canal | URL |
|---|---|
| Site principal | https://calcularrendapassiva.com |
| Google Play | https://play.google.com/store/apps/details?id=com.cwrsiqueira.crp_app |
| App Store | https://apps.apple.com/us/app/calculadora-renda-passiva/id6762054224 |
| Lovable (descontinuado) | https://calcularrendapassiva.lovable.app |

### O que o produto faz
Simulador financeiro completo para independência financeira no Brasil:
- Renda passiva com FII (Fundos de Investimento Imobiliário)
- Simulação de dividendos de ações
- Tesouro Direto e renda fixa (IPCA+, CDI, prefixado)
- Juros compostos e evolução do patrimônio
- Meta de aposentadoria e FIRE (Financial Independence, Retire Early)
- Quanto investir por mês para atingir a meta

### Monetização atual do app
- Versão gratuita com AdMob
- PRO: pagamento único R$12,99 (vitalício) — remove anúncios + histórico ilimitado

### Outros produtos (para replicar a máquina depois)
- **Calc IMC** — calculadora de IMC (Health & Fitness)
  - Play Store: https://play.google.com/store/apps/details?id=br.com.carlosdev.imc
  - App Store: https://apps.apple.com/us/app/calc-imc/id6762569468
- **Outros domínios do ecossistema:**
  - https://charconverter.com
  - https://calcularemprestimo.com
  - https://calcularaposentadoria.com
  - https://calculadorasfinanceiras.com.br

---

## 3. Visão estratégica — A Máquina de Vendas

### Objetivo geral
Construir uma máquina de vendas replicável para cada produto. A lógica é:
1. Lançar a máquina em um produto
2. Acompanhar métricas por 60–90 dias
3. Se vingar → escalar e focar
4. Manter em background e replicar para o próximo produto
5. Com o tempo, ter uma carteira de produtos gerando renda passiva

### Estrutura da máquina (para cada produto)
```
Produto validado
    ↓
Landing page / site (SEO + captura de leads + CTA)
    ↓
Artigos de blog (SEO, tráfego orgânico, interno)
    ↓
ASO (se app) — App Store + Google Play
    ↓
Redes sociais (Instagram + TikTok + YouTube)
    ↓
Funil de email (boas-vindas → nutrição → oferta PRO)
    ↓
WhatsApp Business (conversão direta)
    ↓
Dashboard de acompanhamento (KPIs semanais)
    ↓
Remarketing (Meta Ads — após pixel maduro)
    ↓
Afiliados (após conversão provada)
    ↓
Decisão: escalar ou pivotar
```

### Critérios de decisão (após 60 dias com máquina completa)
- **Escalar:** CAC < LTV, tráfego crescendo semana a semana
- **Pivotar ângulo:** tráfego existe mas conversão baixa → mudar mensagem
- **Abandonar:** 90 dias sem nenhuma tração em nenhum canal → próximo produto

---

## 4. Diagnóstico atual do ecossistema CRP

### Site (calcularrendapassiva.com)

#### O que está bom
- Domínio exato com keyword principal
- Meta title, description e og:locale pt_BR corretos
- 5 artigos publicados no blog
- Links de afiliado Hotmart já integrados (3 produtos)
- Sitemap presente (verificar se atualizado)
- HTML puro — rastreável pelo Google (decisão correta)

#### Problemas críticos
- **Queda de 8k para 2k visitas** causada pela migração para Lovable (React CSR)
  → URLs antigas do Lovable podem ainda estar indexadas, fragmentando autoridade
- **Sem captura de email estruturada** — campo "Quero novidades" sem isca digital
- **Sem pixel do Meta** instalado — impossível fazer remarketing
- **AdSense instalado** — $0,02/dia, prejudica Core Web Vitals e taxa de conversão
- **Sem Schema markup** (WebApplication, Article, FAQPage, BreadcrumbList)
- **Sem texto de suporte SEO** na home abaixo da calculadora
- **Sem internal links** cruzados entre artigos

#### Problemas secundários
- Lovable.app sem canonical próprio — possível duplicação de conteúdo
- Blog com 5 artigos — bom começo, precisa escalar para 15–20

### App Store (iOS)
#### Problemas críticos
- **Idioma listado como "EN English"** — app em português, invisível para buscas PT-BR
- **Otimizado para iPad** — deveria ser iPhone (público principal)
- **Zero avaliações** na App Store

#### O que está bom
- Descrição bem escrita em português
- Monetização freemium configurada
- Screenshots presentes

### Google Play (Android)
#### O que está bom
- 5,0 estrelas, 8 avaliações
- 500+ downloads
- Trailer de vídeo publicado
- Atualizações frequentes (sinal positivo para algoritmo)
- Screenshots presentes

#### Melhorias necessárias
- Título não usa os 30 caracteres disponíveis (falta keyword secundária)
- Short description (80 chars) pode ser mais keyword-dense

### Redes sociais
- **Instagram:** não existe para este produto
- **TikTok:** não existe para este produto
- **YouTube:** canal @carlosjornadadev existe mas sem vídeos sobre o app/site
- **WhatsApp Business:** não configurado para o produto

### Demanda (Google Trends — dados reais coletados)
- Termos do ecossistema com volume forte e constante: "ações", "investimentos",
  "tesouro direto", "dividendos" — pico entre 13h e 20h
- Top query relacionada: "o que é renda passiva" (interesse educacional)
- Queries de "renda passiva" em queda de 50–60% vs período anterior
- **Conclusão:** ângulo de entrada deve ser pela dor específica
  ("quanto rende meu dinheiro no Tesouro?"), não pelo termo genérico

---

## 5. Decisões estratégicas já tomadas

### Monetização — decisões finais

#### Site
| Canal | Decisão |
|---|---|
| AdSense | **REMOVER** — $7/ano, prejudica SEO e conversão |
| Afiliados Hotmart | **MANTER E AMPLIAR** — muito mais rentável com o mesmo tráfego |
| Captura de email | **CRIAR** — isca digital + sequência de 5 emails |
| CTA para o app | **DESTACAR** na home, acima e abaixo da calculadora |

#### App
| Item | Decisão |
|---|---|
| Modelo de cobrança | **MANTER pagamento único** — produto de uso episódico, assinatura não faz sentido |
| Preço | **AJUSTAR para R$19,90** — R$12,99 sinaliza barato, conversão similar com LTV dobrado |
| AdMob | **REPOSICIONAR** — banner apenas na tela de resultado (após uso satisfeito), não durante |
| Interstitial | Apenas ao reabrir o app, nunca durante simulação |
| Incentivo PRO | Anúncio desaparece ao comprar — incentivo claro e não invasivo |

### Tecnologia do site
- **HTML/CSS/JS puro** — decisão correta e mantida
- React (Lovable) foi descartado por prejudicar SEO (CSR invisível para crawlers)
- Migração para HTML puro foi a causa do problema, não a solução — o problema foi
  a migração mal feita (URLs quebradas, autoridade fragmentada)

### ASO — decisão
- App Store: corrigir idioma para PT-BR, reescrever metadados, focar em iPhone
- Google Play: otimizar título e short description com keywords brasileiras
- Solicitar avaliações in-app após 3+ simulações completadas (meta: 50 em 60 dias)

---

## 6. Checklist da máquina de vendas — 28 etapas em 5 fases

### Fase 1 — Base técnica e SEO (Semana 1) ✅ CONCLUÍDA

- [x] **1.1** Auditar Google Search Console — encontrar URLs do Lovable ainda indexadas,
       erros de rastreamento, páginas duplicadas, redirecionamentos quebrados
- [x] **1.2** Verificar e corrigir sitemap.xml — listar todos os artigos e a home,
       submeter no Search Console, remover URLs antigas
- [x] **1.3** Adicionar Schema markup na home — WebApplication + FAQPage (JSON-LD)
- [x] **1.4** Adicionar Schema nos artigos — Article + BreadcrumbList em cada artigo
- [x] **1.5** Adicionar texto de suporte SEO na home — 3–4 parágrafos abaixo da calculadora
- [x] **1.6** Criar internal links entre artigos — cada artigo linka para 2+ outros + calculadora
- [x] **1.7** Corrigir ASO App Store — idioma PT-BR, iPhone, título (30 chars), keywords (100 chars)
- [x] **1.8** Otimizar metadados Google Play — título completo (30 chars), short description (80 chars)

**Entregáveis da Fase 1:**
- `index.html` refatorado (sem AdSense, com schema, com texto SEO, com formulário de captura)
- Template de artigo com schema Article + BreadcrumbList
- `sitemap.xml` atualizado
- Metadados ASO prontos para copiar nas lojas

### Fase 2 — Captura de leads e funil (Semana 2) ✅ CONCLUÍDA

- [x] **2.1** Isca digital: Planilha Google Sheets PT + EN (verificadas, links /view sem login)
       → PT: "Planilha: Quanto Preciso Investir para Viver de Renda [2026]"
       → EN: "How Much Do I Need to Invest to Live Off My Passive Investments [2026]"
- [x] **2.2** Formulário de captura integrado com Brevo — seção "Planilha grátis de renda passiva"
       antes dos afiliados; listas 11 (PT) e 12 (EN); api/subscribe.js roteia por idioma
- [x] **2.3** 10 emails criados em docs/ (5 PT + 5 EN):
       - Email 1: boas-vindas + entrega da planilha via link Google Sheets
       - Email 2: erro comum (poupança vs LCI/LCA / savings vs HYSA)
       - Email 3: 3 dicas avançadas da calculadora
       - Email 4: simulação real (R$2k→R$4.466/mês | $1k→$1.553/mo)
       - Email 5 PT: oferta app PRO R$19,90 (pagamento único)
       - Email 5 EN: app em português — CTA para web calculator EN
- [ ] **2.4** Instalar pixel do Meta — eventos: PageView, Lead, DownloadApp
- [ ] **2.5** Configurar GA4 — eventos: clique calculadora, resultado gerado,
       clique Play Store, clique App Store

### Fase 3 — Conteúdo SEO (Semanas 2–3) 🟡

- [ ] **3.1** Artigo: "Quanto investir para R$5.000/mês de renda passiva"
       → +4.000 chars, simulações reais por tipo de investimento, CTA calculadora
- [ ] **3.2** Artigo: "Como viver de renda passiva no Brasil — guia completo"
       → Público FIRE, alta intenção, linkagem para todos os artigos
- [ ] **3.3** Artigo: "FII ou Tesouro Direto — qual rende mais?"
       → Comparação, meio de funil, alta conversão para calculadora
- [ ] **3.4** Landing page `/app` — converter visitante do site em usuário do app
       → Screenshots, reviews, benefícios PRO, botões das lojas

### Fase 4 — Redes sociais e tráfego social (Semanas 3–4) 🔵

- [ ] **4.1** Criar perfil Instagram @calcularrendapassiva — bio otimizada, conta profissional
- [ ] **4.2** Publicar primeiros 3 Reels:
       → "Quanto rende R$100k por mês?"
       → "Você sabe quanto precisa pra se aposentar?"
       → "FII vs Poupança: veja a diferença em 20 anos"
       → Formato: tela da calculadora + narração
- [ ] **4.3** Criar perfil TikTok @calcularrendapassiva — prioridade alta (maior alcance orgânico BR)
- [ ] **4.4** Publicar primeiro vídeo YouTube — "Como calcular sua renda passiva ideal" (8–15 min)
       → Canal já existe: @carlosjornadadev
- [ ] **4.5** Configurar WhatsApp Business — resposta automática, link para app e site

### Fase 5 — Escala e decisão (Mês 2+) 🟢

- [ ] **5.1** Montar dashboard de acompanhamento semanal
       → Métricas: visitas, leads, downloads por loja, conversão gratuito→PRO, receita afiliados
- [ ] **5.2** Ativar remarketing Meta Ads — após 200+ visitantes/semana no pixel
       → Budget inicial: R$10–15/dia
- [ ] **5.3** Ativar programa de afiliados para o app PRO
       → Influenciadores de finanças, Hotmart ou programa próprio
- [ ] **5.4** Avaliar métricas de decisão (60 dias) — escalar ou pivotar
- [ ] **5.5** Solicitar avaliações in-app — após 3+ simulações completadas, meta: 50 reviews em 60 dias
- [ ] **5.6** Replicar a máquina para o próximo produto (Calc IMC ou novo)

---

## 7. Projeção de receita realista (90 dias com máquina funcionando)

| Fonte | Estimativa mensal |
|---|---|
| Afiliados Hotmart (2–5 vendas/mês × R$40) | R$80–200 |
| App PRO R$19,90 (50 conversões/mês) | R$995 |
| AdMob app (usuários gratuitos) | R$30–80 |
| **Total projetado** | **R$800–1.500/mês** |

> Meta de validação: qualquer receita consistente e crescente após 60 dias = escalar.
> Sem tração após 90 dias completos = pivotar para próximo produto (Calc IMC).

---

## 8. Próxima sessão — por onde começar

**A primeira ação é a auditoria do Google Search Console.**

Passos:
1. Acessar https://search.google.com/search-console
2. Selecionar propriedade calcularrendapassiva.com
3. Ir em "Cobertura" → anotar quantas URLs estão indexadas e quais têm erro
4. Ir em "URL removidas" → verificar se há páginas do Lovable ainda ativas
5. Ir em "Links" → ver quais páginas têm mais backlinks (preservar essas URLs)
6. Compartilhar os dados com o Claude para análise

**Em paralelo, preparar para enviar:**
- Arquivo `index.html` do site atual
- Arquivos HTML dos artigos do blog
- Qualquer arquivo de configuração relevante (robots.txt, .htaccess)

**Com esses arquivos em mãos, Claude entrega na mesma sessão:**
- `index.html` refatorado completo
- `sitemap.xml` atualizado
- Schema JSON-LD para home e artigos
- Template de artigo otimizado
- Metadados ASO prontos para as lojas

---

## 9. Regras do projeto (para o Claude seguir sempre)

1. **Nunca pular fases** — a ordem do checklist é deliberada e cada fase alimenta a próxima
2. **Sempre HTML/CSS/JS puro** no site — sem React, sem framework CSR
3. **AdSense está removido** — não sugerir reinstalar em nenhuma hipótese
4. **Preço do PRO é R$19,90** (decisão tomada) — não questionar
5. **Decisão de escalar ou pivotar só após 60 dias** com máquina completa rodando
6. **Produto principal:** Calculadora Renda Passiva — Calc IMC é o próximo na fila
7. **Afiliados Hotmart já existem** no site — manter e ampliar, não substituir
8. **Brevo ou MailerLite** para email marketing (gratuitos, fáceis de integrar em HTML puro)
9. Ao receber arquivos HTML, **sempre preservar a estrutura existente** e adicionar/corrigir
   apenas o que está no checklist
10. **Métricas de sucesso semanais:** visitas, leads captados, downloads, receita

---

## 10. Contexto técnico do site

- **Stack:** HTML puro + CSS + JavaScript vanilla
- **Hospedagem:** (verificar com Carlos — provavelmente Vercel, Netlify ou similar)
- **Domínio:** calcularrendapassiva.com
- **robots.txt:** presente (verificar conteúdo)
- **sitemap.xml:** presente (verificar se atualizado pós-migração)
- **Analytics:** verificar se GA4 está instalado corretamente
- **Pixel Meta:** não instalado — etapa 2.4 do checklist

---

*Documento gerado em 13/05/2026 — sessão de planejamento estratégico completa.*
*Atualizar este arquivo sempre que uma decisão importante for tomada ou uma etapa concluída.*
