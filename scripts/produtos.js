// Monta a lista de investimentos da calculadora a partir de scripts/taxas.json.
// O build grava o resultado em dist/dados/taxas.json, lido pela calculadora no navegador.
//
// Cada produto traz `taxa` = { tipo, data, fonte } para a calculadora mostrar a situação:
//   mercado    → buscada pelo robô mensal (data = quando foi confirmada; velha ⇒ "pode estar desatualizada")
//   estimativa → média sem fonte oficial automática (data = última revisão)
//   historica  → média de longo prazo (sem data)

const num = (v, d = 2) => Number(v).toFixed(d).replace('.', ',');
const numEn = (v, d = 2) => Number(v).toFixed(d);
const r2 = v => Math.round(v * 100) / 100;

// Inflação usada na calculadora: a esperada para 12 meses (Focus) quando houver; senão, a dos últimos 12 meses
const inflacaoPT = T => (typeof T.ipcaEsperado12m === 'number' ? T.ipcaEsperado12m : T.ipca12m);

const em = (T, chave) => (T.atualizadoEm && T.atualizadoEm[chave]) || T.dataISO;
const mercado = (T, chave, fonte) => ({ tipo: 'mercado', data: em(T, chave), fonte });
const estimativa = T => ({ tipo: 'estimativa', data: T.revisadoEm || T.dataISO });

function produtosPT(T) {
  const lci = T.cdi * T.lciPercentCdi / 100;
  const ipca = inflacaoPT(T);
  const ipcaMais = ((1 + ipca / 100) * (1 + T.tesouroIpcaReal / 100) - 1) * 100;
  const BC = 'Banco Central';
  return [
    { id: 'cdb', nome: 'CDB 100% do CDI', anual: T.cdi, ir: 'regressivo', taxa: mercado(T, 'cdi', BC),
      nota: 'IR de 22,5% a 15% conforme o prazo.' },
    { id: 'tesouro-selic', nome: 'Tesouro Selic', anual: T.selic, custodia: T.custodiaTesouro, ir: 'regressivo', taxa: mercado(T, 'selic', BC),
      nota: `Desconta ${num(T.custodiaTesouro)}% ao ano de taxa da B3. IR de 22,5% a 15% conforme o prazo.` },
    { id: 'lci', nome: `LCI/LCA ${T.lciPercentCdi}% do CDI`, anual: r2(lci), ir: 'isento', taxa: mercado(T, 'cdi', BC),
      nota: `${T.lciPercentCdi}% do CDI. Isenta de IR para pessoa física.` },
    { id: 'tesouro-ipca', nome: 'Tesouro IPCA+', anual: r2(ipcaMais), custodia: T.custodiaTesouro, ir: 'regressivo', taxa: mercado(T, 'tesouroIpcaReal', 'Tesouro Transparente'),
      nota: `IPCA (${num(ipca)}% ${typeof T.ipcaEsperado12m === 'number' ? 'esperado para' : 'nos últimos'} 12 meses) + ${num(T.tesouroIpcaReal)}% ao ano. Desconta ${num(T.custodiaTesouro)}% de taxa da B3. IR de 22,5% a 15%.` },
    { id: 'poupanca', nome: 'Poupança', mensal: T.poupancaMensal, anual: r2((Math.pow(1 + T.poupancaMensal / 100, 12) - 1) * 100), ir: 'isento', taxa: mercado(T, 'poupancaMensal', BC),
      nota: `${num(T.poupancaMensal)}% ao mês. Isenta de IR.` },
    { id: 'fii', nome: 'Fundos imobiliários (FIIs)', anual: T.fiiDividendYield, ir: 'isento', estimativa: true, taxa: estimativa(T),
      nota: 'Isento de IR. Só os rendimentos: não considera valorização nem queda das cotas.' },
    { id: 'acoes', nome: 'Ações de dividendos', anual: T.acoesDividendYield, ir: 'isento', estimativa: true, taxa: estimativa(T),
      nota: 'Só os dividendos: não considera valorização nem queda das ações.' },
  ];
}

function produtosEN(E, dataISO) {
  const est = { tipo: 'estimativa', data: E.revisadoEm || dataISO };
  return [
    { id: 'hysa', nome: 'High-yield savings account', anual: E.hysa, ir: E.taxInterest, estimativa: true, taxa: est,
      nota: `Interest taxed as ordinary income (~${E.taxInterest}% estimate).` },
    { id: 'cd', nome: '1-year CD', anual: E.cd1y, ir: E.taxInterest, estimativa: true, taxa: est,
      nota: `Interest taxed as ordinary income (~${E.taxInterest}% estimate).` },
    { id: 'tbill', nome: 'Treasury bills', anual: E.tbill, ir: E.taxInterest,
      taxa: { tipo: 'mercado', data: (E.atualizadoEm && E.atualizadoEm.tbill) || dataISO, fonte: 'U.S. Treasury' },
      nota: `Federal tax only (~${E.taxInterest}% estimate), no state tax.` },
    { id: 'dividend-etf', nome: 'Dividend ETF', anual: E.dividendEtf, ir: E.taxDividends, estimativa: true, taxa: est,
      nota: `Qualified dividends taxed at ~${E.taxDividends}%. Price changes not included.` },
    { id: 'index-fund', nome: 'S&P 500 index fund', anual: E.stockReturn, ir: E.taxDividends, estimativa: true, taxa: { tipo: 'historica' },
      nota: 'Returns vary a lot from year to year.' },
  ];
}

function dadosPublicos(T) {
  return {
    pt: { referencia: T.referencia, dataISO: T.dataISO, inflacaoAnual: inflacaoPT(T), fontes: T.fontes, produtos: produtosPT(T) },
    en: { referencia: T.en.referencia, dataISO: T.dataISO, inflacaoAnual: T.en.inflation, fontes: T.en.fontes, produtos: produtosEN(T.en, T.dataISO) },
  };
}

module.exports = { produtosPT, produtosEN, dadosPublicos, numEn };
