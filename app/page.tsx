'use client'
import { MouseEvent, useEffect, useState } from "react"

export default function Home() {
  const [periodo, setPeriodo] = useState('')
  const [vlrIni, setVlrIni] = useState('')
  const [vlrRecorr, setVlrRecorr] = useState('')
  const [txPeriodo, setTxPeriodo] = useState('')
  const [renda, setRenda] = useState('')
  const [valorAcumulado, setValorAcumulado] = useState('')

  const menus = [
    {
      title: 'Home',
      url: '/'
    },
    {
      title: 'Doações',
      url: '/#doacoes'
    },
  ]

  function maskMoney(str: string | number) {
    let parte1;
    let parte2;
    let parte11;
    let parte12;
    let parte111;
    let parte112;

    if (typeof str == "number") {
      str = str.toString()
    }

    if (isNaN(parseInt(str)) || str == '0') {
      return '';
    }

    if (str.length == 1) {
      return `0,0${str}`;
    }

    if (str.length == 2) {
      return `0,${str}`;
    }

    parte1 = str.slice(0, -2);
    parte2 = str.slice(-2);

    if (parte1.length > 3) {
      parte11 = parte1.slice(0, -3)
      parte12 = parte1.slice(-3)

      if (parte11.length > 3) {
        parte111 = parte11.slice(0, -3)
        parte112 = parte11.slice(-3)

        parte11 = `${parte111}.${parte112}`
      }

      parte1 = `${parte11}.${parte12}`

    }

    return `${parte1},${parte2}`;
  }

  function formatarVlr(vlr: string, campo: string) {
    if (vlr.length > 14) {
      return false;
    }
    let newVlr = parseInt(vlr.replace(/[^\d]/g, ''));
    let valorFormatado = maskMoney(newVlr.toString());

    console.log(valorFormatado, campo)

    switch (campo) {
      case 'setVlrIni':
        setVlrIni(valorFormatado);
        break;
      case 'setVlrRecorr':
        setVlrRecorr(valorFormatado);
        break;
      case 'setTxPeriodo':
        setTxPeriodo(valorFormatado);
        break;
      case 'setValorAcumulado':
        setValorAcumulado(valorFormatado);
        break;
      case 'setRenda':
        setRenda(valorFormatado);
        break;

      default:
        break;
    }
  }

  const handleCalc = (e: MouseEvent<HTMLInputElement>) => {
    e.preventDefault()

    // if (periodo == '') {
    //   calcularTempoAplicacao();
    // }

    let camposPreenchidos = [
      periodo,
      vlrIni,
      vlrRecorr,
      txPeriodo,
      renda,
    ]

    let totalCamposNPreenchidos = 0;
    let campoEmBranco: number = 999;
    camposPreenchidos.forEach((item, key) => {
      if (item == '' || item == '0,00') {
        totalCamposNPreenchidos++;
        campoEmBranco = key
      }
    })

    if (totalCamposNPreenchidos > 1) {
      alert('Erro! Apenas 1 campo deve ser deixado em branco.')
      return false;
    }

    if (totalCamposNPreenchidos < 1) {
      alert('Erro! Pelo menos 1 campo deve ser deixado em branco.')
      return false;
    }

    switch (campoEmBranco) {
      case 0:
        calcularTempoAplicacao()
        break;
      case 1:
        calcularValorInicial()
        break;
      case 2:
        calcularValorRecorrente()
        break;
      case 3:
        calcularTaxaMensal()
        break;
      case 4:
        calcularRendaPassiva()
        break;

      default:
        alert('Erro! Campo em branco não identificado. Tente novamente.')
        break;
    }
  }

  const calcularTempoAplicacao = () => {
    let ctaVlrIni = parseFloat(vlrIni.replace(/\./g, '').replace(',', '.'));
    let ctaVlrRecorr = parseFloat(vlrRecorr.replace(/\./g, '').replace(',', '.'));
    let ctaTxPeriodo = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));
    let ctaVlrAcumulado = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));
    let ctaRenda = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));

    console.log(ctaVlrIni)
    console.log(ctaVlrRecorr)
    console.log(ctaTxPeriodo)
    console.log(ctaVlrAcumulado)
    console.log(ctaRenda)

    if ((!ctaVlrIni && !ctaVlrRecorr) || !ctaTxPeriodo || (!ctaVlrAcumulado && !ctaRenda)) {
      alert('Para calcular Tempo de aplicação preencha Valor inicial, Valor recorrente (opcional), Taxa mensal e, Valor acumulado e/ou Renda passiva.');
      return;
    }

  }

  const calcularValorInicial = () => { }

  const calcularValorRecorrente = () => { }

  const calcularTaxaMensal = () => { }

  const calcularRendaPassiva = () => {
    let crpPeriodo = parseInt(periodo);
    let crpVlrIni = parseFloat(vlrIni.replace(/\./g, '').replace(',', '.'));
    let crpVlrRecorr = parseFloat(vlrRecorr.replace(/\./g, '').replace(',', '.'));
    let crpTxPeriodo = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));

    let aplicTotal = 0;
    let rentAtual = 0;
    let rentabilidade = 0;
    let rendimentos = 0;
    let i = 1;

    aplicTotal = crpVlrIni + crpVlrRecorr;
    rentAtual = (crpVlrIni * (1 + crpTxPeriodo / 100)) + crpVlrRecorr;
    for (i = 1; i < crpPeriodo; i++) {
      aplicTotal += crpVlrRecorr;
      rentAtual = (rentAtual * (1 + crpTxPeriodo / 100)) + crpVlrRecorr;
    }
    rentabilidade = rentAtual - aplicTotal;
    rendimentos = rentAtual * (crpTxPeriodo / 100)

    console.log(aplicTotal)
    console.log(rentAtual)
    console.log(rentabilidade)
    console.log(rendimentos)
    console.log(crpPeriodo)

    formatarVlr(rendimentos.toFixed(2), 'setRenda')
    formatarVlr(rentAtual.toFixed(2), 'setValorAcumulado')
  }

  return (
    <div>
      <nav className="flex justify-between bg-stone-400 p-2">
        <div className='flex items-center uppercase font-semibold'><a href="/">Calculadora de Renda Passiva</a></div>
        <ul className='flex justify-between'>
          {menus.map((item, index) => (
            <li key={index} className={`p-1 border-2 border-stone-400 hover:text-white hover:border-white`}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex justify-center mt-1">
        <div className="flex justify-center rounded shadow-lg md:w-1/2">
          <div className="flex justify-center flex-col items-center p-3 w-full">
            <h1 className="uppercase font-semibold text-slate-500">Calculadora</h1>
            <small>Deixe em branco o campo que você quer calcular</small>
            <form className="w-full">
              <div className="relative pt-3.5 my-2 w-full">
                <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown" type="number" name="periodo" id="periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder=" " />
                <label className=" text-gray-400 pointer-events-none absolute top-0 left-0 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="periodo">Tempo de aplicação (meses)</label>
              </div>
              <div className="relative pt-3.5 my-2">
                <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown" type="search" name="vlrIni" id="vlrIni" value={vlrIni} onChange={(e) => formatarVlr(e.target.value, 'setVlrIni')} placeholder=" " />
                <label className=" text-gray-400 pointer-events-none absolute top-0 left-0 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="vlrIni">Valor inicial (R$)</label>
              </div>
              <div className="relative pt-3.5 my-2">
                <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown" type="search" name="vlrRecorr" id="vlrRecorr" value={vlrRecorr} onChange={(e) => formatarVlr(e.target.value, 'setVlrRecorr')} placeholder=" " />
                <label className=" text-gray-400 pointer-events-none absolute top-0 left-0 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="vlrRecorr">Valor recorrente (R$)</label>
              </div>
              <div className="relative pt-3.5 my-2">
                <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown" type="search" name="txPeriodo" id="txPeriodo" value={txPeriodo} onChange={(e) => formatarVlr(e.target.value, 'setTxPeriodo')} placeholder=" " />
                <label className=" text-gray-400 pointer-events-none absolute top-0 left-0 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="txPeriodo">Taxa mensal (%)</label>
              </div>
              <div className="relative pt-3.5 my-2">
                <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown" type="search" name="valorAcumulado" id="valorAcumulado" value={valorAcumulado} onChange={(e) => formatarVlr(e.target.value, 'setValorAcumulado')} placeholder=" " />
                <label className=" text-gray-400 pointer-events-none absolute top-0 left-0 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="renda">Valor Acumulado (R$)</label>
              </div>
              <div className="relative pt-3.5 my-2">
                <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown" type="search" name="renda" id="renda" value={renda} onChange={(e) => formatarVlr(e.target.value, 'setRenda')} placeholder=" " />
                <label className=" text-gray-400 pointer-events-none absolute top-0 left-0 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="renda">Renda passiva (R$)</label>
              </div>
              <input className="w-full cursor-pointer uppercase my-2 p-2 bg-blue-700 rounded text-white hover:bg-blue-600 font-medium" type="submit" onClick={(e) => handleCalc(e)} value="Calcular" />
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
