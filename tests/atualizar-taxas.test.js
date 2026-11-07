// Testes da leitura das fontes e da trava de scripts/atualizar-taxas.js (sem acessar a internet)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const A = require('../scripts/atualizar-taxas.js');
const taxas = require('../scripts/taxas.json');

test('SGS: pega o último valor até hoje e ignora datas futuras', () => {
  const lista = [
    { data: '05/11/2026', valor: '13.75' },
    { data: '06/11/2026', valor: '13.75' },
    { data: '10/12/2026', valor: '12.75' }, // futuro (Selic meta)
    { data: '04/11/2026', valor: '14.25' },
  ];
  assert.deepEqual(A.ultimoSGS(lista, '2026-11-07'), { d: '2026-11-06', v: 13.75 });
  assert.throws(() => A.ultimoSGS([{ data: '10/12/2026', valor: '1' }], '2026-11-07'));
});

test('Tesouro IPCA+: mediana da data-base mais recente, sem juros semestrais', () => {
  const csv = [
    'Tipo Titulo;Data Vencimento;Data Base;Taxa Compra Manha;Taxa Venda Manha;PU Compra Manha;PU Venda Manha;PU Base Manha',
    'Tesouro IPCA+;15/05/2045;05/11/2026;7,48;7,60;1;1;1',
    'Tesouro IPCA+;15/08/2032;05/11/2026;7,92;8,04;1;1;1',
    'Tesouro IPCA+;15/08/2040;05/11/2026;7,62;7,74;1;1;1',
    'Tesouro IPCA+;15/08/2040;04/11/2026;9,99;9,99;1;1;1',
    'Tesouro IPCA+ com Juros Semestrais;15/08/2060;05/11/2026;1,00;1,00;1;1;1',
    'Tesouro Selic;01/03/2029;05/11/2026;0,06;0,07;1;1;1',
  ].join('\n');
  assert.deepEqual(A.taxaIpcaMais(csv), { v: 7.62, d: '2026-11-05' });
});

test('T-bill: 13 semanas (coupon equivalent) da data mais recente', () => {
  const csv = 'Date,"4 WEEKS COUPON EQUIVALENT","13 WEEKS COUPON EQUIVALENT"\n11/05/2026,3.96,4.10\n11/06/2026,3.95,4.11\n';
  assert.deepEqual(A.tbill13(csv), { d: '2026-11-06', v: 4.11 });
});

test('CPI: variação em 12 meses do mesmo mês', () => {
  const json = { Results: { series: [{ data: [
    { year: '2026', period: 'M09', value: '336.940' },
    { year: '2026', period: 'M08', value: '334.980' },
    { year: '2025', period: 'M13', value: '999' },
    { year: '2025', period: 'M09', value: '324.900' },
  ] }] } };
  assert.deepEqual(A.cpi12m(json), { v: 3.7, d: '2026-09' });
});

test('trava: valores normais passam', () => {
  assert.deepEqual(A.validar({ selic: 13.25, cdi: 13.15, ipca12m: 4.4, poupancaMensal: 0.66, 'en.tbill': 4.0 }, taxas), []);
});

test('trava: fora da faixa, salto grande ou valor inválido barram a gravação', () => {
  const p = A.validar({ selic: 0, cdi: 18, ipca12m: NaN, 'en.tbill': 40 }, taxas);
  assert.equal(p.length, 6, p.join('\n')); // selic e tbill: fora da faixa + salto
  assert.ok(p.some(x => x.startsWith('selic') && x.includes('fora da faixa')));
  assert.ok(p.some(x => x.startsWith('cdi') && x.includes('mudou')));
  assert.ok(p.some(x => x.startsWith('ipca12m') && x.includes('inválido')));
});

test('referência do mês em PT e EN', () => {
  assert.deepEqual(A.referencias(new Date('2026-11-12T12:00:00Z')), { pt: 'novembro de 2026', en: 'November 2026' });
});
