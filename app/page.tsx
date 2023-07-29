'use client'
import { MouseEvent, useEffect, useState } from "react"

export default function Home() {
  const [periodo, setPeriodo] = useState('')
  const [vlrIni, setVlrIni] = useState('')
  const [vlrRecorr, setVlrRecorr] = useState('')
  const [txPeriodo, setTxPeriodo] = useState('')
  const [renda, setRenda] = useState('')

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

    if (isNaN(parseInt(str)) || str.length == 0) {
      return '0,00';
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
      case 'setRenda':
        setRenda(valorFormatado);
        break;

      default:
        break;
    }
  }

  const handleCalc = (e: MouseEvent<HTMLInputElement>) => {
    e.preventDefault()

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

    console.log(campoEmBranco)

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

  const calcularTempoAplicacao = () => { }

  const calcularValorInicial = () => { }

  const calcularValorRecorrente = () => { }

  const calcularTaxaMensal = () => { }

  const calcularRendaPassiva = () => {
    console.log(periodo)
    console.log(vlrIni)
    console.log(vlrRecorr)
    console.log(txPeriodo)
    console.log(renda)
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
          <div className="flex justify-center flex-col items-center p-3">
            <h1 className="uppercase font-semibold text-slate-500">Calculadora</h1>
            <small>Deixe em branco o campo que você quer calcular</small>
            <form>
              <input className="w-full my-2 p-2 outline-0 border-indigo-500 focus:border-b-2 ease-in-out duration-150" type="number" name="periodo" id="periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="Tempo de aplicação em meses" />
              <input className="w-full my-2 p-2 w-full my-2 p-2 focus:outline-0 focus:border-b-2 focus:border-indigo-500 ease-in-out duration-150" type="search" name="vlrIni" id="vlrIni" value={vlrIni} onChange={(e) => formatarVlr(e.target.value, 'setVlrIni')} placeholder="Valor inicial" />
              <input className="w-full my-2 p-2 w-full my-2 p-2 focus:outline-0 focus:border-b-2 focus:border-indigo-500 ease-in-out duration-150" type="search" name="vlrRecorr" id="vlrRecorr" value={vlrRecorr} onChange={(e) => formatarVlr(e.target.value, 'setVlrRecorr')} placeholder="Valor recorrente" />
              <input className="w-full my-2 p-2 w-full my-2 p-2 focus:outline-0 focus:border-b-2 focus:border-indigo-500 ease-in-out duration-150" type="search" name="txPeriodo" id="txPeriodo" value={txPeriodo} onChange={(e) => formatarVlr(e.target.value, 'setTxPeriodo')} placeholder="Taxa mensal" />
              <input className="w-full my-2 p-2 w-full my-2 p-2 focus:outline-0 focus:border-b-2 focus:border-indigo-500 ease-in-out duration-150" type="search" name="renda" id="renda" value={renda} onChange={(e) => formatarVlr(e.target.value, 'setRenda')} placeholder="Renda passiva" />
              <input className=" cursor-pointer uppercase w-full my-2 p-2 bg-blue-700 rounded text-white hover:bg-blue-600 font-medium" type="submit" onClick={(e) => handleCalc(e)} value="Calcular" />
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
