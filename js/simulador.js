/* ===== Motor da calculadora (funções puras) =====
   Usado no navegador (window.Simulador) e nos testes (require).
   Simplificações assumidas (avisadas ao usuário):
   - juros compostos mensais, aporte no fim de cada mês;
   - IR aplicado sobre o rendimento de cada mês (na prática é cobrado no resgate);
   - "valores de hoje": taxa real = (1 + taxa líquida) / (1 + inflação) − 1, com aportes corrigidos pela inflação;
   - renda passiva = patrimônio × taxa mensal usada (vive só do rendimento, sem consumir o patrimônio). */
(function (root) {
  'use strict';

  const MAX_MESES = 1200; // 100 anos

  // Tabela regressiva do IR na renda fixa (meses até o resgate → alíquota %)
  const IR_REGRESSIVO = [[6, 22.5], [12, 20], [24, 17.5], [Infinity, 15]];

  function aliquotaIR(produto, meses) {
    if (!produto || produto.ir === 'isento' || produto.ir == null) return 0;
    if (typeof produto.ir === 'number') return produto.ir;
    const m = meses > 0 ? meses : Infinity;
    for (const [limite, aliq] of IR_REGRESSIVO) if (m <= limite) return aliq;
    return 15;
  }

  const mensalDe = anualPct => Math.pow(1 + anualPct / 100, 1 / 12) - 1;
  const anualDe = mensal => Math.pow(1 + mensal, 12) - 1;

  // Taxa mensal (fração) a usar no cálculo
  function taxaMensal(produto, op) {
    const o = op || {};
    const bruta = produto.mensal != null
      ? produto.mensal / 100
      : mensalDe((produto.anual || 0) - (produto.custodia || 0));
    const aliquota = o.imposto ? aliquotaIR(produto, o.meses) : 0;
    const liquida = bruta * (1 - aliquota / 100);
    const usada = o.inflacao ? (1 + liquida) / (1 + mensalDe(o.inflacaoAnual || 0)) - 1 : liquida;
    return { bruta, aliquota, liquida, usada };
  }

  function valorFuturo(inicial, aporte, r, n) {
    if (n <= 0) return inicial;
    if (r === 0) return inicial + aporte * n;
    const f = Math.pow(1 + r, n);
    return inicial * f + aporte * (f - 1) / r;
  }

  function serie(inicial, aporte, r, n) {
    if (!(n > 0)) return [];
    const passo = n > 120 ? Math.ceil(n / 60) : n > 24 ? 3 : 1;
    const pontos = [];
    for (let m = 0; m <= n; m += passo) pontos.push({ m, acum: valorFuturo(inicial, aporte, r, m), invest: inicial + aporte * m });
    if (pontos[pontos.length - 1].m !== n) pontos.push({ m: n, acum: valorFuturo(inicial, aporte, r, n), invest: inicial + aporte * n });
    return pontos;
  }

  const positivo = v => typeof v === 'number' && isFinite(v) && v > 0;
  const naoNeg = v => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);

  /* p = { modo, produto, imposto, inflacao, inflacaoAnual, inicial, aporte, meses, renda }
     modos: 'renda' (quanto vou ter), 'aporte' (quanto investir por mês),
            'prazo' (em quanto tempo), 'patrimonio' (quanto preciso juntar) */
  function simular(p) {
    const inicial = naoNeg(p.inicial);
    const aporte = naoNeg(p.aporte);
    const renda = naoNeg(p.renda);
    const meses = Math.round(naoNeg(p.meses));
    const op = { imposto: !!p.imposto, inflacao: !!p.inflacao, inflacaoAnual: p.inflacaoAnual };
    if (!p.produto) return { erro: 'produto' };

    const taxa = m => taxaMensal(p.produto, Object.assign({ meses: m }, op));
    const base = { modo: p.modo, inicial, aporte, renda, meses };
    const fim = (t, campos) => {
      const r = Object.assign(base, campos);
      r.investido = r.inicial + r.aporte * r.meses;
      r.rendimentos = r.acumulado - r.investido;
      r.taxa = t;
      r.taxaAnual = anualDe(t.usada);
      r.pontos = serie(r.inicial, r.aporte, t.usada, r.meses);
      return r;
    };

    switch (p.modo) {
      case 'renda': {
        if (!(meses > 0) || !(inicial > 0 || aporte > 0)) return { erro: 'campos' };
        const t = taxa(meses);
        if (!(t.usada > 0)) return { erro: 'taxa' };
        const acumulado = valorFuturo(inicial, aporte, t.usada, meses);
        return fim(t, { acumulado, renda: acumulado * t.usada });
      }
      case 'aporte': {
        if (!positivo(renda) || !(meses > 0)) return { erro: 'campos' };
        const t = taxa(meses);
        if (!(t.usada > 0)) return { erro: 'taxa' };
        const alvo = renda / t.usada;
        const f = Math.pow(1 + t.usada, meses);
        const ap = (alvo - inicial * f) * t.usada / (f - 1);
        if (ap <= 0) {
          const acumulado = valorFuturo(inicial, 0, t.usada, meses);
          return fim(t, { aporte: 0, acumulado, renda: acumulado * t.usada, inicialBasta: true });
        }
        return fim(t, { aporte: ap, acumulado: alvo });
      }
      case 'prazo': {
        if (!positivo(renda) || !(inicial > 0 || aporte > 0)) return { erro: 'campos' };
        // A alíquota regressiva depende do prazo, que é o que se procura: refina algumas vezes.
        let n = Infinity, t = taxa(Infinity);
        for (let i = 0; i < 4; i++) {
          if (!(t.usada > 0)) return { erro: 'taxa' };
          const alvo = renda / t.usada;
          let novo;
          if (inicial >= alvo) novo = 0;
          else {
            const x = Math.log((alvo * t.usada + aporte) / (inicial * t.usada + aporte)) / Math.log(1 + t.usada);
            novo = Math.ceil(x - 1e-9);
          }
          if (novo > MAX_MESES) return { erro: 'inalcancavel' };
          if (novo === n) break;
          n = novo;
          t = taxa(n);
        }
        const acumulado = valorFuturo(inicial, aporte, t.usada, n);
        return fim(t, { meses: n, acumulado, renda: acumulado * t.usada, jaAtingido: n === 0 });
      }
      case 'patrimonio': {
        if (!positivo(renda)) return { erro: 'campos' };
        const t = taxa(Infinity);
        if (!(t.usada > 0)) return { erro: 'taxa' };
        return fim(t, { inicial: 0, aporte: 0, meses: 0, acumulado: renda / t.usada });
      }
      default:
        return { erro: 'modo' };
    }
  }

  const api = { aliquotaIR, taxaMensal, valorFuturo, serie, simular, mensalDe, anualDe, MAX_MESES };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Simulador = api;
})(typeof window !== 'undefined' ? window : this);
