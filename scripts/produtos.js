// Monta a lista de investimentos da calculadora a partir de scripts/taxas.json.
// O build grava o resultado em dist/dados/taxas.json, lido pela calculadora no navegador.

const num = (v, d = 2) => Number(v).toFixed(d).replace('.', ',');
const numEn = (v, d = 2) => Number(v).toFixed(d);
const r2 = v => Math.round(v * 100) / 100;

function produtosPT(T) {
  const lci = T.cdi * T.lciPercentCdi / 100;
  const ipcaMais = ((1 + T.ipca12m / 100) * (1 + T.tesouroIpcaReal / 100) - 1) * 100;
  return [
    { id: 'cdb', nome: 'CDB 100% do CDI', anual: T.cdi, ir: 'regressivo',
      nota: `CDI de ${num(T.cdi)}% ao ano. IR de 22,5% a 15% conforme o prazo.` },
    { id: 'tesouro-selic', nome: 'Tesouro Selic', anual: T.selic, custodia: T.custodiaTesouro, ir: 'regressivo',
      nota: `Selic de ${num(T.selic)}% ao ano, menos ${num(T.custodiaTesouro)}% de taxa da B3. IR de 22,5% a 15% conforme o prazo.` },
    { id: 'lci', nome: `LCI/LCA ${T.lciPercentCdi}% do CDI`, anual: r2(lci), ir: 'isento',
      nota: `${num(lci)}% ao ano. Isenta de IR para pessoa física.` },
    { id: 'tesouro-ipca', nome: 'Tesouro IPCA+', anual: r2(ipcaMais), custodia: T.custodiaTesouro, ir: 'regressivo',
      nota: `IPCA (${num(T.ipca12m)}% em 12 meses) + ${num(T.tesouroIpcaReal)}% ao ano, menos ${num(T.custodiaTesouro)}% de taxa da B3. IR de 22,5% a 15%.` },
    { id: 'poupanca', nome: 'Poupança', mensal: T.poupancaMensal, ir: 'isento',
      nota: `${num(T.poupancaMensal)}% ao mês. Isenta de IR.` },
    { id: 'fii', nome: 'Fundos imobiliários (FIIs)', anual: T.fiiDividendYield, ir: 'isento', estimativa: true,
      nota: `Rendimento médio estimado de ${num(T.fiiDividendYield, 0)}% ao ano, isento de IR. Só os rendimentos: não considera valorização nem queda das cotas.` },
    { id: 'acoes', nome: 'Ações de dividendos', anual: T.acoesDividendYield, ir: 'isento', estimativa: true,
      nota: `Dividendos médios estimados de ${num(T.acoesDividendYield, 0)}% ao ano. Não considera valorização nem queda das ações.` },
  ];
}

function produtosEN(E) {
  return [
    { id: 'hysa', nome: 'High-yield savings account', anual: E.hysa, ir: E.taxInterest,
      nota: `${numEn(E.hysa, 1)}% APY. Interest taxed as ordinary income (~${E.taxInterest}% estimate).` },
    { id: 'cd', nome: '1-year CD', anual: E.cd1y, ir: E.taxInterest,
      nota: `${numEn(E.cd1y, 1)}% APY. Interest taxed as ordinary income (~${E.taxInterest}% estimate).` },
    { id: 'tbill', nome: 'Treasury bills', anual: E.tbill, ir: E.taxInterest,
      nota: `${numEn(E.tbill, 1)}% per year. Federal tax only (~${E.taxInterest}% estimate), no state tax.` },
    { id: 'dividend-etf', nome: 'Dividend ETF', anual: E.dividendEtf, ir: E.taxDividends, estimativa: true,
      nota: `${numEn(E.dividendEtf, 1)}% average yield (estimate). Qualified dividends ~${E.taxDividends}%. Price changes not included.` },
    { id: 'index-fund', nome: 'S&P 500 index fund', anual: E.stockReturn, ir: E.taxDividends, estimativa: true,
      nota: `${numEn(E.stockReturn, 0)}% long-term average total return. Real returns vary a lot year to year.` },
  ];
}

function dadosPublicos(T) {
  return {
    pt: { referencia: T.referencia, dataISO: T.dataISO, inflacaoAnual: T.ipca12m, fontes: T.fontes, produtos: produtosPT(T) },
    en: { referencia: T.en.referencia, dataISO: T.dataISO, inflacaoAnual: T.en.inflation, fontes: T.en.fontes, produtos: produtosEN(T.en) },
  };
}

module.exports = { produtosPT, produtosEN, dadosPublicos };
