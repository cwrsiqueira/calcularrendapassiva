// Páginas programáticas EN (/en/articles/...) — público dos EUA, RPM maior que PT.
// Chamado por scripts/paginas.js; taxas no bloco "en" de scripts/taxas.json.

const fs = require('fs');
const path = require('path');
const { renderArticle } = require('./template');

const T = require('./taxas.json');
const E = T.en;

// ---------- formatação ----------
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const usd = v => '$' + nf0.format(Math.round(v));
const pct = (v, d = 1) => (v * 100).toFixed(d) + '%';

function longo(v, titulo) {
  if (v >= 1e6) return '$' + (v / 1e6) + (titulo ? ' Million' : ' million');
  return usd(v);
}
function prazo(meses) {
  if (!isFinite(meses)) return 'more than 60 years';
  const total = Math.ceil(meses);
  const a = Math.floor(total / 12), m = total % 12;
  const pa = a ? `${a} year${a > 1 ? 's' : ''}` : '';
  const pm = m ? `${m} month${m > 1 ? 's' : ''}` : '';
  return [pa, pm].filter(Boolean).join(' and ') || 'less than 1 month';
}
const anos = meses => (meses / 12).toFixed(1).replace(/\.0$/, '');

// ---------- taxas ----------
const mensal = anual => Math.pow(1 + anual, 1 / 12) - 1;
const INV = [
  { nome: 'High-yield savings account', taxa: E.hysa / 100, nota: 'variable APY, FDIC insured' },
  { nome: '1-year CD', taxa: E.cd1y / 100, nota: 'locked for 12 months' },
  { nome: '3-month Treasury bills', taxa: E.tbill / 100, nota: 'no state income tax' },
  { nome: 'Dividend ETF (e.g. SCHD-style)', taxa: E.dividendEtf / 100, nota: 'estimated yield, price fluctuates' },
  { nome: `${E.withdrawal}% rule withdrawal`, taxa: E.withdrawal / 100, nota: 'stock/bond portfolio, inflation-adjusted' },
];
const realM = mensal(E.realReturn / 100);
const mesesPara = (alvo, aporte, r, inicial = 0) => {
  // n tal que inicial*(1+r)^n + aporte*((1+r)^n-1)/r = alvo
  const x = (alvo * r + aporte) / (inicial * r + aporte);
  return x <= 0 ? Infinity : Math.log(x) / Math.log(1 + r);
};

const notaTaxas = `<p><small>Reference rates (${E.referencia}): high-yield savings ${pct(E.hysa / 100, 2)} APY, 1-year CD ${pct(E.cd1y / 100, 2)}, 3-month T-bills ${pct(E.tbill / 100, 2)}, dividend ETF yield ~${pct(E.dividendEtf / 100)}, stock market long-term average ${E.stockReturn}% a year (${E.realReturn}% after inflation). Figures are before taxes: interest is taxed as ordinary income, qualified dividends at lower rates. Sources: ${E.fontes}. Not financial advice.</small></p>`;

const callout = texto => `            <div class="article-callout">
              <span><strong>${texto}</strong></span>
              <a href="/en/">Use the Calculator <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
            </div>`;

const tabela = (cab, linhas) => `            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr>
                </thead>
                <tbody>
${linhas.map(l => `                  <tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
                </tbody>
              </table>
            </div>`;

const metaLinha = min => `Read time: ${min} min &middot; Updated ${E.referencia}`;

// ---------- séries ----------
const EARN = [50e3, 100e3, 200e3, 250e3, 300e3, 400e3, 500e3, 750e3, 1e6, 1.5e6, 2e6, 3e6, 5e6, 10e6];
const slugEarn = v => `en/articles/how-much-does-${v >= 1e6 ? String(v / 1e6).replace('.', '-') + '-million' : v / 1000 + 'k'}-earn-per-month`;

const MAKE = [1e3, 2e3, 3e3, 4e3, 5e3, 6e3, 7e3, 8e3, 10e3, 15e3, 20e3];
const slugMake = v => `en/articles/how-much-to-invest-to-make-${v / 1000}k-a-month`;

const LONG = [100, 200, 300, 500, 1000, 1500, 2000, 3000, 5000];
const slugLong = a => `en/articles/how-long-to-save-1-million-investing-${a}-a-month`;

function vizinhos(lista, v, n = 2) {
  const i = lista.indexOf(v);
  return lista.slice(Math.max(0, i - n), i).concat(lista.slice(i + 1, i + 1 + n));
}

const GUIAS = {
  retire: { href: '/en/articles/how-much-to-retire', title: 'How Much Do You Need to Retire?' },
  fire: { href: '/en/articles/fire-movement-guide', title: 'The FIRE Movement: A Complete Guide' },
  etf: { href: '/en/articles/best-dividend-etfs', title: 'Best Dividend ETFs for Passive Income' },
  build: { href: '/en/articles/how-to-build-passive-income', title: 'How to Build Passive Income' },
  sp500: { href: '/en/articles/sp500-historical-returns', title: 'S&P 500 Historical Returns' },
};

// ---------- página: how much does $X earn per month ----------
function paginaEarn(v) {
  const L = longo(v);
  const LT = longo(v, true);
  const linhas = INV.map(i => [i.nome, pct(i.taxa, 2), usd(v * i.taxa / 12), usd(v * i.taxa), i.nota]);
  const seguro = v * E.withdrawal / 100 / 12;
  const juros = v * E.hysa / 100 / 12;
  const cobre = seguro / E.gastoMensalMedio;
  const avaliacao = cobre < 0.25
    ? `is not enough to retire on by itself, but it is a solid <strong>income supplement</strong> and a strong base to keep compounding`
    : cobre < 0.6
      ? `covers about <strong>${Math.round(cobre * 100)}% of the average American household's spending</strong> — not enough on its own, but combined with Social Security it can fund a modest retirement`
      : cobre < 1
        ? `covers about <strong>${Math.round(cobre * 100)}% of the average American household's spending</strong> — enough for a lean retirement in a low-cost area, or a comfortable one alongside Social Security`
      : `covers the <strong>average American household's spending</strong>${cobre > 2 ? ' with plenty of room to spare' : ''} — a realistic early-retirement number for most people`;
  const proximo = MAKE.reduce((b, x) => Math.abs(x - seguro) < Math.abs(b - seguro) ? x : b);
  const crescer = [500, 1000, 2000, 5000].map(a => [usd(a) + '/month', prazo(mesesPara(v, a, realM)), usd(a * Math.ceil(mesesPara(v, a, realM)))]);

  const faq = [
    { q: `How much interest does ${L} earn per month?`, a: `In a high-yield savings account paying ${pct(E.hysa / 100, 2)} APY, ${L} earns about ${usd(juros)} per month (${usd(v * E.hysa / 100)} a year) before taxes. A 1-year CD at ${pct(E.cd1y / 100, 2)} pays about ${usd(v * E.cd1y / 100 / 12)} per month.` },
    { q: `Can I live off the interest of ${L}?`, a: `Using the ${E.withdrawal}% rule, ${L} supports about ${usd(seguro)} per month, adjusted for inflation every year. The average U.S. household spends about ${usd(E.gastoMensalMedio)} per month, so ${L} ${cobre >= 1 ? 'can' : 'cannot'} cover average spending on its own.` },
    { q: `What is the safest way to earn monthly income on ${L}?`, a: `High-yield savings accounts and CDs are FDIC insured up to $250,000 per depositor per bank, and Treasury bills are backed by the U.S. government. ${v > 250000 ? `With ${L}, spread cash across several banks or use Treasuries to stay fully protected.` : ''}`.trim() },
    { q: `How much will ${L} be worth in 10 years?`, a: `At the stock market's long-term average of ${E.stockReturn}% a year, ${L} would grow to about ${usd(v * Math.pow(1 + E.stockReturn / 100, 10))} in 10 years — about ${usd(v * Math.pow(1 + E.realReturn / 100, 10))} in today's dollars after inflation. Returns are not guaranteed.` },
  ];

  const rel = vizinhos(EARN, v).map(x => ({ href: '/' + slugEarn(x), title: `How Much Does ${longo(x, true)} Earn per Month?` }))
    .concat([{ href: '/' + slugMake(proximo), title: `How Much to Invest to Make ${usd(proximo)} a Month` }, GUIAS.retire, GUIAS.etf]);

  const body = `            <p><strong>${L} earns between ${usd(v * Math.min(...INV.map(i => i.taxa)) / 12)} and ${usd(v * Math.max(...INV.map(i => i.taxa)) / 12)} per month</strong> in today's safest options, depending on where you put it. In a high-yield savings account at ${pct(E.hysa / 100, 2)} APY, that's about <strong>${usd(juros)} a month</strong> in interest. Below are the numbers for each option with ${E.referencia} rates.</p>

            <h2>Monthly Income from ${L} by Investment</h2>
${tabela(['Investment', 'Rate / yield', 'Per month', 'Per year', 'Notes'], linhas)}
            ${notaTaxas}

${callout(`Try your own amount, contributions and rate.`)}

            <h2>Interest vs. the ${E.withdrawal}% Rule</h2>
            <p>Living only on interest keeps your principal intact, but cash rates move with the Federal Reserve: when rates fall, your income falls too. The <a href="/en/articles/how-much-to-retire">${E.withdrawal}% rule</a> takes a different approach — invest in a diversified stock and bond portfolio and withdraw ${E.withdrawal}% in the first year, then adjust for inflation. On ${L} that's about <strong>${usd(seguro)} per month</strong>, and historically it has lasted at least 30 years in most scenarios.</p>

            <h2>Is ${L} Enough to Retire?</h2>
            <p>The average American household spends about ${usd(E.gastoMensalMedio)} per month. A ${L} portfolio ${avaliacao}. Add Social Security, a pension or part-time income and the picture improves quickly.</p>

            <h2>How Long Does It Take to Save ${L}?</h2>
            <p>Starting from zero and earning ${E.realReturn}% a year after inflation (the stock market's long-term real average):</p>
${tabela(['Monthly investment', 'Time to reach ' + L, 'Total contributed'], crescer)}
            <p>Everything above what you contributed comes from <strong>compound growth</strong> — which is why starting early matters more than starting big.</p>`;

  return {
    lang: 'en',
    slug: slugEarn(v),
    title: `How Much Does ${LT} Earn per Month? [${E.referencia.split(' ')[1]} Rates]`,
    description: `${L} earns about ${usd(juros)}/month in a high-yield savings account and ${usd(seguro)}/month with the ${E.withdrawal}% rule. See CDs, T-bills and dividend ETFs with ${E.referencia} rates.`,
    h1: `How Much Does ${LT} Earn per Month?`,
    breadcrumb: `${LT} per Month`,
    meta: metaLinha(5),
    body, faq, related: rel,
    cta: `See how much ${L} can earn with your own numbers.`,
  };
}

// ---------- página: how much to invest to make $X a month ----------
function paginaMake(v) {
  const L = usd(v);
  const anual = v * 12;
  const metas = [
    ['High-yield savings (' + pct(E.hysa / 100, 2) + ')', anual / (E.hysa / 100), 'Rate can drop when the Fed cuts'],
    ['1-year CD (' + pct(E.cd1y / 100, 2) + ')', anual / (E.cd1y / 100), 'Rate locked for one year'],
    ['Dividend ETF (~' + pct(E.dividendEtf / 100) + ')', anual / (E.dividendEtf / 100), 'Dividends tend to grow over time'],
    [E.withdrawal + '% rule', anual * 100 / E.withdrawal, 'Inflation-adjusted for 30+ years'],
    ['3.5% rule (early retirement)', anual / 0.035, 'Safer for 40+ year retirements'],
  ];
  const alvo = anual * 100 / E.withdrawal;
  const aportes = [500, 1000, 2000, 3000, 5000].map(a => [usd(a) + '/month', prazo(mesesPara(alvo, a, realM)), prazo(mesesPara(alvo, a, realM, 50000))]);

  const faq = [
    { q: `How much do I need to invest to make ${L} a month?`, a: `Using the ${E.withdrawal}% rule you need about ${usd(alvo)}. If you only want to live on interest from a high-yield savings account at ${pct(E.hysa / 100, 2)}, you need about ${usd(anual / (E.hysa / 100))}, and with a dividend ETF yielding ~${pct(E.dividendEtf / 100)}, about ${usd(anual / (E.dividendEtf / 100))}.` },
    { q: `How long does it take to make ${L} a month in passive income?`, a: `Investing $1,000 a month at ${E.realReturn}% after inflation, you reach ${usd(alvo)} in about ${prazo(mesesPara(alvo, 1000, realM))}. With $2,000 a month it takes about ${prazo(mesesPara(alvo, 2000, realM))}.` },
    { q: `Is ${L} a month enough to retire?`, a: `${L} a month is ${usd(anual)} a year. ${v >= E.gastoMensalMedio ? 'That is above the average U.S. household spending, so it is enough for most people.' : `The average U.S. household spends about ${usd(E.gastoMensalMedio)} a month, so ${L} works best combined with Social Security or other income.`}` },
  ];

  const rel = vizinhos(MAKE, v).map(x => ({ href: '/' + slugMake(x), title: `How Much to Invest to Make ${usd(x)} a Month` }))
    .concat([GUIAS.fire, GUIAS.build, { href: '/' + slugLong(1000), title: 'How Long to Save $1 Million Investing $1,000 a Month' }]);

  const body = `            <p>To make <strong>${L} a month</strong> (${usd(anual)} a year) in passive income, you need roughly <strong>${usd(alvo)}</strong> invested using the ${E.withdrawal}% rule — or ${usd(anual / (E.cd1y / 100))} if you want to live only on CD interest at today's rates. Here is the full breakdown with ${E.referencia} rates.</p>

            <h2>How Much You Need to Make ${L} a Month</h2>
${tabela(['Strategy', 'Amount needed', 'Notes'], metas.map(m => [m[0], usd(m[1]), m[2]]))}
            ${notaTaxas}

${callout(`Calculate your exact number for ${L} a month.`)}

            <h2>The Formula</h2>
            <p><code>Amount needed = Monthly income × 12 ÷ yield</code></p>
            <p><code>${L} × 12 ÷ ${E.withdrawal}% = ${usd(alvo)}</code></p>
            <p>The lower the yield you assume, the bigger the target — but the safer your income. Cash yields look attractive today, but they follow the Federal Reserve. The <a href="/en/articles/how-much-to-retire">${E.withdrawal}% rule</a> assumes a stock-heavy portfolio that grows with inflation.</p>

            <h2>How Long to Get There</h2>
            <p>Time to reach ${usd(alvo)} investing every month at ${E.realReturn}% a year after inflation:</p>
${tabela(['Monthly investment', 'Starting from $0', 'Starting with $50,000'], aportes)}

            <h2>Ways to Get There Faster</h2>
            <ul>
              <li><strong>Max out tax-advantaged accounts</strong> — 401(k) match first, then a Roth IRA (see <a href="/en/articles/401k-vs-roth-ira">401(k) vs Roth IRA</a>).</li>
              <li><strong>Raise contributions with every raise</strong> — increasing them 5–10% a year cuts years off the timeline.</li>
              <li><strong>Reinvest dividends</strong> during the accumulation phase.</li>
              <li><strong>Lower your target</strong> — every $100 less in monthly spending reduces the goal by ${usd(100 * 12 * 100 / E.withdrawal)}.</li>
            </ul>`;

  return {
    lang: 'en',
    slug: slugMake(v),
    title: `How Much to Invest to Make ${L} a Month in Passive Income`,
    description: `To make ${L} a month you need about ${usd(alvo)} with the ${E.withdrawal}% rule, or ${usd(anual / (E.hysa / 100))} in a high-yield savings account. See how long it takes with ${E.referencia} rates.`,
    h1: `How Much Do I Need to Invest to Make ${L} a Month?`,
    breadcrumb: `${L} a Month`,
    meta: metaLinha(5),
    body, faq, related: rel,
    cta: `Plan your path to ${L} a month.`,
  };
}

// ---------- página: how long to save $1 million investing $X a month ----------
function paginaLong(a) {
  const A = usd(a);
  const cenarios = [6, 8, 10].map(r => {
    const n = mesesPara(1e6, a, mensal(r / 100));
    return [`${r}% a year`, prazo(n), usd(a * Math.ceil(n)), usd(1e6 - a * Math.ceil(n))];
  });
  const nBase = mesesPara(1e6, a, mensal(E.stockReturn / 100));
  const nReal = mesesPara(1e6, a, realM);
  const idades = [25, 30, 35, 40, 45].map(i => [`${i}`, isFinite(nBase) ? `${Math.ceil(i + nBase / 12)}` : '—', isFinite(nReal) ? `${Math.ceil(i + nReal / 12)}` : '—']);
  const outros = [250e3, 500e3, 2e6].map(m => [longo(m), prazo(mesesPara(m, a, mensal(E.stockReturn / 100)))]);

  const faq = [
    { q: `How long does it take to save $1 million investing ${A} a month?`, a: `At the stock market's long-term average of ${E.stockReturn}% a year, investing ${A} a month gets you to $1 million in about ${prazo(nBase)}. At a more conservative 6%, it takes about ${prazo(mesesPara(1e6, a, mensal(0.06)))}.` },
    { q: `How much of the $1 million is my own money?`, a: `At ${E.stockReturn}% a year you contribute about ${usd(a * Math.ceil(nBase))}; the remaining ${usd(1e6 - a * Math.ceil(nBase))} comes from compound growth.` },
    { q: `What is $1 million worth after inflation?`, a: `Measured in today's dollars (${E.realReturn}% real return), reaching $1 million of purchasing power takes about ${prazo(nReal)} investing ${A} a month.` },
    { q: `How much monthly income does $1 million produce?`, a: `With the ${E.withdrawal}% rule, $1 million supports about ${usd(1e6 * E.withdrawal / 100 / 12)} a month. In a high-yield savings account at ${pct(E.hysa / 100, 2)}, it earns about ${usd(1e6 * E.hysa / 100 / 12)} a month in interest.` },
  ];

  const rel = vizinhos(LONG, a).map(x => ({ href: '/' + slugLong(x), title: `How Long to Save $1 Million Investing ${usd(x)} a Month` }))
    .concat([{ href: '/' + slugEarn(1e6), title: 'How Much Does $1 Million Earn per Month?' }, GUIAS.sp500, GUIAS.fire]);

  const body = `            <p>Investing <strong>${A} a month</strong> at the stock market's long-term average of ${E.stockReturn}% a year, you reach <strong>$1 million in about ${prazo(nBase)}</strong>. Here's how the timeline changes with different returns, starting ages and goals.</p>

            <h2>Time to $1 Million Investing ${A} a Month</h2>
${tabela(['Annual return', 'Time to $1 million', 'You contribute', 'Compound growth'], cenarios)}
            ${notaTaxas}

${callout('Run your own timeline with your contribution and return.')}

            <h2>At What Age Will You Be a Millionaire?</h2>
${tabela(['Starting age', `Millionaire at (${E.stockReturn}% nominal)`, `In today's dollars (${E.realReturn}% real)`], idades)}
            <p>The "today's dollars" column accounts for ~3% inflation: $1 million in the future buys less than $1 million today. See <a href="/en/articles/sp500-historical-returns">S&amp;P 500 historical returns</a> for why ${E.stockReturn}% is the usual long-term assumption.</p>

            <h2>Other Goals with ${A} a Month</h2>
${tabela(['Goal', `Time at ${E.stockReturn}% a year`], outros)}

            <h2>How to Get There Faster</h2>
            <ul>
              <li><strong>Use a 401(k) match</strong> — it's an instant 50–100% return on your contribution.</li>
              <li><strong>Keep costs low</strong> — broad index funds charge 0.03–0.10% a year.</li>
              <li><strong>Increase ${A} over time</strong> — raising it 5% a year cuts years off the timeline.</li>
              <li><strong>Stay invested in down markets</strong> — buying during drops is what makes the average work.</li>
            </ul>`;

  return {
    lang: 'en',
    slug: slugLong(a),
    title: `How Long to Save $1 Million Investing ${A} a Month?`,
    description: `Investing ${A} a month at ${E.stockReturn}% a year, you reach $1 million in about ${prazo(nBase)}. See timelines at 6%, 8% and 10%, by starting age, and in today's dollars.`,
    h1: `How Long Does It Take to Save $1 Million Investing ${A} a Month?`,
    breadcrumb: `$1 Million at ${A}/Month`,
    meta: metaLinha(5),
    body, faq, related: rel,
    cta: 'See your own path to $1 million.',
  };
}

// ---------- geração ----------
function gerarEn(ROOT) {
  const paginas = [...EARN.map(paginaEarn), ...MAKE.map(paginaMake), ...LONG.map(paginaLong)];
  for (const p of paginas) {
    fs.writeFileSync(path.join(ROOT, p.slug + '.html'), renderArticle({ ...p, datePublished: T.dataISO, dateModified: T.dataISO }));
  }

  // hub /en/articles
  const dir = path.join(ROOT, 'en', 'articles');
  const todos = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    return { href: '/en/articles/' + f.replace(/\.html$/, ''), title: m ? m[1].replace(/<[^>]+>/g, '').trim() : f };
  });
  const num = t => { const m = t.match(/\$([\d,.]+)\s*(million|k)?/i); if (!m) return 0; const n = parseFloat(m[1].replace(/,/g, '')); return /million/i.test(m[2] || '') ? n * 1e6 : /k/i.test(m[2] || '') ? n * 1e3 : n; };
  const grupos = [
    { nome: 'How much does it earn per month?', teste: h => /-earn-per-month$/.test(h) },
    { nome: 'How much to invest for monthly income', teste: h => /how-much-to-invest-to-make-/.test(h) },
    { nome: 'How long to save $1 million', teste: h => /how-long-to-save-1-million/.test(h) },
  ];
  const usados = new Set();
  let secoes = '';
  for (const g of grupos) {
    const itens = todos.filter(t => g.teste(t.href)).sort((x, y) => num(x.title) - num(y.title));
    itens.forEach(i => usados.add(i.href));
    secoes += `\n            <h2>${g.nome}</h2>\n            <ul>\n${itens.map(i => `              <li><a href="${i.href}">${i.title}</a></li>`).join('\n')}\n            </ul>\n`;
  }
  const guias = todos.filter(t => !usados.has(t.href)).sort((x, y) => x.title.localeCompare(y.title));
  secoes = `\n            <h2>Passive income and retirement guides</h2>\n            <ul>\n${guias.map(i => `              <li><a href="${i.href}">${i.title}</a></li>`).join('\n')}\n            </ul>\n` + secoes;

  fs.writeFileSync(path.join(dir, 'index.html'), renderArticle({
    lang: 'en',
    slug: 'en/articles',
    title: 'Passive Income, Retirement and FIRE Articles',
    description: 'Every article and simulation from the Passive Income Calculator: how much each amount earns per month, how much to invest for each income goal and how long it takes.',
    h1: 'Passive Income Articles and Simulations',
    breadcrumb: 'Articles',
    meta: `${todos.length} articles &middot; Updated ${E.referencia}`,
    datePublished: '2026-10-16', dateModified: T.dataISO,
    body: `            <p>Simulations updated with ${E.referencia} rates and guides to plan your financial independence. Pick a topic below or go straight to the <a href="/en/">passive income calculator</a>.</p>\n${secoes}`,
  }));

  return { total: paginas.length, hub: todos.length };
}

module.exports = { gerarEn };
