// Testes do motor da calculadora (js/simulador.js) e da lista de investimentos (scripts/produtos.js)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/simulador.js');
const { dadosPublicos } = require('../scripts/produtos.js');
const taxas = require('../scripts/taxas.json');

const perto = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);
const fixo1 = { id: 'x', mensal: 1, ir: 'isento' };          // 1% ao mês, sem IR
const cdb = { id: 'cdb', anual: 12, ir: 'regressivo' };

test('IR regressivo segue a tabela por prazo', () => {
  assert.equal(S.aliquotaIR(cdb, 6), 22.5);
  assert.equal(S.aliquotaIR(cdb, 7), 20);
  assert.equal(S.aliquotaIR(cdb, 12), 20);
  assert.equal(S.aliquotaIR(cdb, 24), 17.5);
  assert.equal(S.aliquotaIR(cdb, 25), 15);
  assert.equal(S.aliquotaIR(cdb, Infinity), 15);
  assert.equal(S.aliquotaIR({ ir: 'isento' }, 3), 0);
  assert.equal(S.aliquotaIR({ ir: 22 }, 3), 22);
});

test('renda = patrimônio × taxa mensal (R$ 5.000 a 1% a.m. ⇒ R$ 500 mil)', () => {
  const r = S.simular({ modo: 'patrimonio', produto: fixo1, renda: 5000 });
  perto(r.acumulado, 500000);
});

test('taxa anual vira mensal por equivalência composta', () => {
  perto(S.taxaMensal(cdb).bruta, Math.pow(1.12, 1 / 12) - 1, 1e-12);
});

test('imposto reduz a taxa; custódia sai da taxa anual', () => {
  const t = S.taxaMensal(cdb, { imposto: true, meses: 36 });
  perto(t.liquida, t.bruta * 0.85, 1e-12);
  const tes = S.taxaMensal({ anual: 12, custodia: 0.2, ir: 'isento' });
  perto(tes.bruta, S.mensalDe(11.8), 1e-12);
});

test('valores de hoje: taxa real desconta a inflação', () => {
  const t = S.taxaMensal(fixo1, { inflacao: true, inflacaoAnual: 4.5 });
  perto(t.usada, 1.01 / Math.pow(1.045, 1 / 12) - 1, 1e-12);
});

test('modo renda: aporte no fim do mês (1 mês, R$ 100 inicial + R$ 100 ⇒ R$ 201)', () => {
  const r = S.simular({ modo: 'renda', produto: fixo1, inicial: 100, aporte: 100, meses: 1 });
  perto(r.acumulado, 201);
  perto(r.renda, 2.01);
  perto(r.investido, 200);
});

test('os modos se invertem entre si', () => {
  const base = { produto: cdb, imposto: true, inflacao: true, inflacaoAnual: 4.5 };
  const ida = S.simular(Object.assign({ modo: 'renda', inicial: 10000, aporte: 1500, meses: 240 }, base));
  const aporte = S.simular(Object.assign({ modo: 'aporte', inicial: 10000, renda: ida.renda, meses: 240 }, base));
  perto(aporte.aporte, 1500);
  const prazo = S.simular(Object.assign({ modo: 'prazo', inicial: 10000, aporte: 1500, renda: ida.renda - 1 }, base));
  assert.equal(prazo.meses, 240);
});

test('prazo usa a alíquota do prazo encontrado (prazo curto ⇒ IR maior)', () => {
  const r = S.simular({ modo: 'prazo', produto: cdb, imposto: true, inicial: 100000, aporte: 5000, renda: 1100 });
  assert.ok(r.meses <= 12, `meses=${r.meses}`);
  assert.equal(r.taxa.aliquota, S.aliquotaIR(cdb, r.meses));
  assert.ok(r.renda >= 1100);
});

test('valor inicial que já basta ⇒ aporte 0 / prazo 0', () => {
  const a = S.simular({ modo: 'aporte', produto: fixo1, inicial: 1e6, renda: 5000, meses: 12 });
  assert.equal(a.aporte, 0);
  assert.ok(a.inicialBasta);
  const p = S.simular({ modo: 'prazo', produto: fixo1, inicial: 1e6, aporte: 0, renda: 5000 });
  assert.equal(p.meses, 0);
  assert.ok(p.jaAtingido);
});

test('erros: campos faltando, taxa real negativa, meta inalcançável', () => {
  assert.equal(S.simular({ modo: 'renda', produto: fixo1, meses: 12 }).erro, 'campos');
  assert.equal(S.simular({ modo: 'aporte', produto: fixo1, meses: 12 }).erro, 'campos');
  const baixa = { mensal: 0.2, ir: 'isento' };
  assert.equal(S.simular({ modo: 'patrimonio', produto: baixa, renda: 1000, inflacao: true, inflacaoAnual: 10 }).erro, 'taxa');
  assert.equal(S.simular({ modo: 'prazo', produto: { mensal: 0.05, ir: 'isento' }, aporte: 1, renda: 1e6 }).erro, 'inalcancavel');
  assert.equal(S.simular({ modo: 'xyz', produto: fixo1 }).erro, 'modo');
});

test('lista pública de investimentos: PT e EN com taxas válidas', () => {
  const d = dadosPublicos(taxas);
  assert.ok(d.pt.produtos.length >= 5);
  assert.ok(d.en.produtos.length >= 5);
  for (const p of [...d.pt.produtos, ...d.en.produtos]) {
    const taxa = p.mensal != null ? p.mensal * 12 : p.anual;
    assert.ok(taxa > 0 && taxa < 40, `${p.id}: ${taxa}`);
    assert.ok(p.nome && p.nota && p.ir != null, p.id);
    assert.ok(['mercado', 'estimativa', 'historica'].includes(p.taxa && p.taxa.tipo), `${p.id}: tipo da taxa`);
    if (p.taxa.tipo !== 'historica') assert.match(p.taxa.data, /^\d{4}-\d{2}-\d{2}$/, `${p.id}: data da taxa`);
    if (p.taxa.tipo === 'mercado') assert.ok(p.taxa.fonte, `${p.id}: fonte`);
  }
  // Taxas buscadas pelo robô são "mercado"; FII/ações são estimativa
  const tipo = id => d.pt.produtos.find(p => p.id === id).taxa.tipo;
  assert.equal(tipo('cdb'), 'mercado');
  assert.equal(tipo('tesouro-ipca'), 'mercado');
  assert.equal(tipo('fii'), 'estimativa');
  // Poupança traz o equivalente anual para o campo de taxa
  const poup = d.pt.produtos.find(p => p.id === 'poupanca');
  assert.ok(Math.abs(poup.anual - (Math.pow(1 + poup.mensal / 100, 12) - 1) * 100) < 0.01);
  assert.ok(d.pt.referencia && d.pt.inflacaoAnual > 0);
});
