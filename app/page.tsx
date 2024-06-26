'use client'
import { ChangeEvent, MouseEvent, useState } from "react";
import Navbar from "../components/navbar";
import MarketingArea from "@/components/marketingArea";

const Home = () => {
  const [periodo, setPeriodo] = useState('')
  const [vlrIni, setVlrIni] = useState('')
  const [vlrRecorr, setVlrRecorr] = useState('')
  const [txPeriodo, setTxPeriodo] = useState('')
  const [renda, setRenda] = useState('')
  const [valorInvestido, setValorInvestido] = useState('')
  const [valorAcumulado, setValorAcumulado] = useState('')
  const [rendimentosPeriodo, setRendimentosPeriodo] = useState('')
  const [side, setSide] = useState('calcular')

  const handleMaxLength = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    if (event.target.value.length > event.target.maxLength) {
      newValue = event.target.value.slice(0, event.target.maxLength);
    }
    return newValue;
  }

  function maskMoney(str: string | number) {

    // Se o str estiver vazio após a remoção, retorna string vazia
    if (str == 0) return "";

    if (typeof str == "number") {
      str = str.toString()
    }

    // Remover caracteres não numéricos e zeros à esquerda
    str = str.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");

    // Adiciona zeros à esquerda se necessário para garantir pelo menos 3 dígitos
    str = str.padStart(3, "0");

    // Separa parte inteira e decimal
    let parteInteira = str.slice(0, -2);
    let parteDecimal = str.slice(-2);

    // Adiciona pontos como separadores de milhar na parte inteira
    parteInteira = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Combina parte inteira e decimal com uma vírgula
    return `${parteInteira},${parteDecimal}`;
  }

  const formatarVlr = (vlr: string, campo: string) => {
    if (campo === 'setTxPeriodo' && vlr.length > 4) {
      return false;
    }

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
      case 'setValorInvestido':
        setValorInvestido(valorFormatado);
        break;
      case 'setValorAcumulado':
        setValorAcumulado(valorFormatado);
        break;
      case 'setRendimentosPeriodo':
        setRendimentosPeriodo(valorFormatado);
        break;
      case 'setRenda':
        setRenda(valorFormatado);
        break;

      default:
        break;
    }
  }

  const handleClean = () => {
    setVlrIni('');
    setVlrRecorr('');
    setTxPeriodo('');
    setValorInvestido('');
    setValorAcumulado('');
    setRendimentosPeriodo('');
    setRenda('');
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

    setSide('restart')
  }

  const calcularTempoAplicacao = () => {
    let ctaPeriodo = 0;
    let ctaVlrIni = parseFloat(vlrIni.replace(/\./g, '').replace(',', '.'));;
    let ctaVlrRecorr = parseFloat(vlrRecorr.replace(/\./g, '').replace(',', '.'));
    let ctaTxPeriodo = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));
    let ctaRenda = parseFloat(renda.replace(/\./g, '').replace(',', '.'));

    let vlrAtual = ctaVlrIni;
    let montante = ctaRenda / (ctaTxPeriodo / 100);
    let loop = 0;
    let continuar = true;

    while (continuar) {
      if (
        vlrAtual * (1 + ctaTxPeriodo / 100) + ctaVlrRecorr <
        montante
      ) {
        vlrAtual = vlrAtual * (1 + ctaTxPeriodo / 100) + ctaVlrRecorr;
      } else {
        continuar = false;
      }
      loop++;
    }

    let prazo = loop - 1;
    let investido = ctaVlrIni + (ctaVlrRecorr * prazo);
    let rendimentos = vlrAtual - (ctaVlrIni + (ctaVlrRecorr * prazo));
    let acumulado = vlrAtual;

    setPeriodo(prazo.toString())
    setValorInvestido(maskMoney(investido.toFixed(2)));
    setValorAcumulado(maskMoney(acumulado.toFixed(2)));
    setRendimentosPeriodo(maskMoney(rendimentos.toFixed(2)));
    setRenda(maskMoney((acumulado * (ctaTxPeriodo / 100)).toFixed(2)));
  }

  const calcularValorInicial = () => {
    let cviPeriodo = parseInt(periodo);
    let cviVlrIni = 0;
    let cviVlrRecorr = parseFloat(vlrRecorr.replace(/\./g, '').replace(',', '.'));
    let cviTxPeriodo = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));
    let cviRenda = parseFloat(renda.replace(/\./g, '').replace(',', '.'));

    let montante = cviRenda / (cviTxPeriodo / 100);
    let taxaAtualizada = Math.pow(1 + cviTxPeriodo / 100, cviPeriodo);
    let investRecorrenteAtualizado =
      cviVlrRecorr * ((taxaAtualizada - 1) / (cviTxPeriodo / 100));
    let investInicialAtualizado = montante - investRecorrenteAtualizado;
    let investInicial = investInicialAtualizado / taxaAtualizada;

    let prazo = cviPeriodo;
    let investido = investInicial + (cviVlrRecorr * cviPeriodo);
    let rendimentos = montante - (cviVlrRecorr * cviPeriodo) - investInicial;
    let acumulado = montante;

    setPeriodo(prazo.toString())
    setValorInvestido(maskMoney(investido.toFixed(2)));
    setValorAcumulado(maskMoney(acumulado.toFixed(2)));
    setRendimentosPeriodo(maskMoney(rendimentos.toFixed(2)));
    setRenda(maskMoney((acumulado * (cviTxPeriodo / 100)).toFixed(2)));
    setVlrIni(maskMoney(investInicial.toFixed(2)));
  }

  const calcularValorRecorrente = () => {
    let cvrPeriodo = parseInt(periodo);
    let cvrVlrIni = parseFloat(vlrIni.replace(/\./g, '').replace(',', '.'));
    let cvrVlrRecorr = 0;
    let cvrTxPeriodo = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));
    let cvrRenda = parseFloat(renda.replace(/\./g, '').replace(',', '.'));

    let montante = cvrRenda / (cvrTxPeriodo / 100);
    let investInicialCalc = cvrVlrIni * Math.pow(1 + cvrTxPeriodo / 100, cvrPeriodo);
    let taxaCalc = (Math.pow(1 + cvrTxPeriodo / 100, cvrPeriodo) - 1) / (cvrTxPeriodo / 100);

    let investRecorrente = (montante - investInicialCalc) / taxaCalc;

    let prazo = cvrPeriodo;
    let investido = cvrVlrIni + (parseFloat(investRecorrente.toFixed(2)) * cvrPeriodo);
    let rendimentos = montante - (parseFloat(investRecorrente.toFixed(2)) * cvrPeriodo) - cvrVlrIni;
    let acumulado = montante;

    setPeriodo(prazo.toString())
    setValorInvestido(maskMoney(investido.toFixed(2)));
    setValorAcumulado(maskMoney(acumulado.toFixed(2)));
    setRendimentosPeriodo(maskMoney(rendimentos.toFixed(2)));
    setRenda(maskMoney((acumulado * (cvrTxPeriodo / 100)).toFixed(2)));
    setVlrRecorr(maskMoney(investRecorrente.toFixed(2)))
  }

  const calcularTaxaMensal = () => {
    let ctmPeriodo = parseInt(periodo);
    let ctmVlrIni = parseFloat(vlrIni.replace(/\./g, '').replace(',', '.'));
    let ctmVlrRecorr = parseFloat(vlrRecorr.replace(/\./g, '').replace(',', '.'));
    let ctmTxPeriodo = 0;
    let ctmRenda = parseFloat(renda.replace(/\./g, '').replace(',', '.'));;

    let t = 0.01;
    let r = 0;
    let n = ctmPeriodo;
    let cont = true;
    let investInicialAtualizado;
    let investRecorrenteAtualizado;
    let montante = 0;
    let montanteAtualizado = 0;
    let rendaAtualizada = 0;
    let taxaAtualizada = 0;

    while (cont) {
      investInicialAtualizado = ctmVlrIni * Math.pow(1 + t / 100, n);
      investRecorrenteAtualizado =
        ctmVlrRecorr * ((Math.pow(1 + (t / 100), n) - 1) / (t / 100));
      montante = investInicialAtualizado + investRecorrenteAtualizado;
      r = montante * (t / 100);
      if (r >= ctmRenda) {
        cont = false;
      } else {
        rendaAtualizada = r;
        montanteAtualizado = montante;
        taxaAtualizada = t;
        t = t + 0.01;
      }
    }

    let prazo = n;
    let investido = ctmVlrIni + (parseFloat(ctmVlrRecorr.toFixed(2)) * prazo);
    let rendimentos = montanteAtualizado - (parseFloat(ctmVlrRecorr.toFixed(2)) * prazo) - ctmVlrIni;
    let acumulado = montanteAtualizado;

    setPeriodo(prazo.toString())
    setValorInvestido(maskMoney(investido.toFixed(2)));
    setValorAcumulado(maskMoney(acumulado.toFixed(2)));
    setRendimentosPeriodo(maskMoney(rendimentos.toFixed(2)));
    setRenda(maskMoney(rendaAtualizada.toFixed(2)));
    setTxPeriodo(maskMoney(taxaAtualizada.toFixed(2)));
  }

  const calcularRendaPassiva = () => {
    let crpPeriodo = parseInt(periodo);
    let crpVlrIni = parseFloat(vlrIni.replace(/\./g, '').replace(',', '.'));
    let crpVlrRecorr = parseFloat(vlrRecorr.replace(/\./g, '').replace(',', '.'));
    let crpTxPeriodo = parseFloat(txPeriodo.replace(/\./g, '').replace(',', '.'));
    let crpRenda = 0;

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

    let rendimentosPeriodo = rentAtual - aplicTotal;

    if (aplicTotal > 999999999.99 || rentAtual === Infinity || rendimentosPeriodo === Infinity || rendimentos === Infinity) {
      alert('Valores informados levam a resultados infinitos. Verifique os valores e tente novamente.');
    }

    let prazo = crpPeriodo;
    let investido = aplicTotal;
    rendimentos = rendimentosPeriodo;
    let acumulado = rentAtual;

    setPeriodo(prazo.toString())
    setValorInvestido(maskMoney(investido.toFixed(2)));
    setValorAcumulado(maskMoney(acumulado.toFixed(2)));
    setRendimentosPeriodo(maskMoney(rendimentos.toFixed(2)));
    setRenda(maskMoney((acumulado * (crpTxPeriodo / 100)).toFixed(2)));
  }

  // Definindo a tipagem para as props do componente
  type CopyToClipboardButtonProps = {
    textToCopy: string;
  };

  const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ textToCopy }) => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          console.log('Texto copiado com sucesso!');
          alert('Resultado copiado para área de transferência.');
        })
        .catch(err => {
          console.error('Falha ao copiar texto: ', err);
          alert('Algo deu errado, tente novamente.');
        });
    };

    return (
      <button className="w-full cursor-pointer uppercase my-2 p-2 bg-orange-700 rounded text-white hover:bg-orange-600 font-medium" onClick={copyToClipboard}>Copiar Resultado</button>
    );
  };


  return (
    <div className="h-screen">
      <div className="max-[202px]:hidden">

        <Navbar />

        <div id="flex flex-col justify-center items-center">
          <div className={`flip-card text-center mt-3 p-2 ${side === 'restart' ? 'show-result' : ''}`}>
            <h1 className="uppercase font-semibold text-slate-500 sm:text-lg">Calculadora</h1>
            <small className={`text-xs sm:text-base ${side === 'restart' ? 'hidden' : ''}`}>Deixe em branco o campo que você quer calcular</small>
            <small className={`text-xs sm:text-base ${side === 'restart' ? '' : 'hidden'}`}>Resultado baseado nas informações fornecidas</small>
            <div className="flip-card-inner flex justify-center">
              <div className="fields sm:w-[640px] flex justify-center">
                <form className="flex flex-col justify-between w-full h-full">

                  <div>
                    <div className="relative pt-3.5 my-2 w-full flex">
                      <div className="flex flex-col w-full">
                        <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown pl-2" type="number" name="periodo" id="periodo" value={periodo} onChange={(e) => setPeriodo(handleMaxLength(e))} placeholder=" " maxLength={3} />
                        <label className=" text-gray-400 pointer-events-none absolute top-0 left-2 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="periodo">Tempo de aplicação (meses)</label>
                      </div>
                    </div>
                    <div className="relative pt-3.5 my-2 w-full flex">
                      <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown pl-2" type="search" name="vlrIni" id="vlrIni" value={vlrIni} onChange={(e) => setVlrIni(maskMoney(handleMaxLength(e)))} placeholder=" " maxLength={14} />
                      <label className=" text-gray-400 pointer-events-none absolute top-0 left-2 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="vlrIni">Valor inicial (R$)</label>
                    </div>
                    <div className="relative pt-3.5 my-2 w-full flex">
                      <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown pl-2" type="search" name="vlrRecorr" id="vlrRecorr" value={vlrRecorr} onChange={(e) => setVlrRecorr(maskMoney(handleMaxLength(e)))} placeholder=" " maxLength={14} />
                      <label className=" text-gray-400 pointer-events-none absolute top-0 left-2 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="vlrRecorr">Valor recorrente (R$)</label>
                    </div>
                    <div className="relative pt-3.5 my-2 w-full flex">
                      <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown pl-2" type="search" name="txPeriodo" id="txPeriodo" value={txPeriodo} onChange={(e) => setTxPeriodo(maskMoney(handleMaxLength(e)))} placeholder=" " maxLength={5} />
                      <label className=" text-gray-400 pointer-events-none absolute top-0 left-2 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="txPeriodo">Taxa mensal (%)</label>
                    </div>
                    <div className="relative pt-3.5 my-2 w-full flex">
                      <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown pl-2" type="search" name="renda" id="renda" value={renda} onChange={(e) => setRenda(maskMoney(handleMaxLength(e)))} placeholder=" " maxLength={14} />
                      <label className=" text-gray-400 pointer-events-none absolute top-0 left-2 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="renda">Renda passiva (R$)</label>
                    </div>
                    <div className="relative pt-3.5 my-2 w-full flex">
                      <input className="peer text-slate-600 w-full border-0 border-b-2 border-gray-300 outline-none text-base transition-all duration-300 rounded-none focus:border-b-2 focus:border-indigo-500 not-placeholder-shown pl-2" type="search" name="valorAcumulado" id="valorAcumulado" value={valorAcumulado} placeholder=" " disabled={true} />
                      <label className=" text-gray-400 pointer-events-none absolute top-0 left-2 mt-3 transition-all duration-300 peer-focus:text-xs peer-focus:mt-0 peer-focus:text-indigo-500" htmlFor="renda">Valor Acumulado (R$)</label>
                    </div>
                  </div>

                  <div>
                    <input className="w-full cursor-pointer uppercase my-2 p-2 bg-blue-700 rounded text-white hover:bg-blue-600 font-medium" type="submit" onClick={(e) => handleCalc(e)} value="Calcular" />
                    <input className="w-full cursor-pointer uppercase my-2 p-2 bg-red-700 rounded text-white hover:bg-red-600 font-medium" type="submit" onClick={() => handleClean()} value="Limpar" />
                  </div>

                </form>
              </div>

              <div className="result p-3 justify-between sm:w-[640px]">
                <h3>Resultado</h3>
                <div className="resultados w-full">
                  <div className="flex justify-between w-full border-b-2 border-gray-400 my-1">
                    <label className="text-sm sm:text-xl" htmlFor="tempoAplicado">Tempo aplicado:</label>
                    <div className="value text-sm sm:text-xl"> {periodo} meses</div>
                  </div>
                  <div className="flex justify-between w-full border-b-2 border-gray-400 my-1">
                    <label className="text-sm sm:text-xl" htmlFor="vlrInvestidoTotal">Investido:</label>
                    <div className="value text-sm sm:text-xl"> R$ {valorInvestido}</div>
                  </div>
                  <div className="flex justify-between w-full border-b-2 border-gray-400 my-1">
                    <label className="text-sm sm:text-xl" htmlFor="vlrRendimento">Rendimentos:</label>
                    <div className="value text-sm sm:text-xl"> R$ {rendimentosPeriodo}</div>
                  </div>
                  <div className="flex justify-between w-full border-b-2 border-gray-400 my-1">
                    <label className="text-sm sm:text-xl" htmlFor="vlrAcumulado">Acumulado:</label>
                    <div className="value text-sm sm:text-xl"> R$ {valorAcumulado}</div>
                  </div>
                  <div className="flex justify-between w-full border-b-2 border-gray-400 my-1">
                    <label className="text-sm sm:text-xl" htmlFor="txPeriodo">Taxa Mensal:</label>
                    <div className="value text-sm sm:text-xl"> {txPeriodo}%</div>
                  </div>
                  <div className="flex justify-between w-full border-b-2 border-gray-400 my-1">
                    <label className="text-sm sm:text-xl" htmlFor="vlrRendaPassiva">Renda passiva:</label>
                    <div className="value text-sm sm:text-xl"> R$ {renda}</div>
                  </div>
                </div>
                <div className="text-justify text-sm sm:text-base">
                  IMPORTANTE: Lembre-se de que esses cálculos são baseados em projeções e resultados reais podem variar de acordo com o comportamento do mercado financeiro.
                </div>

                <div>
                  <button className="w-full cursor-pointer uppercase my-2 p-2 bg-green-700 rounded text-white hover:bg-green-600 font-medium" onClick={() => setSide('calcular')} id="restart">Refazer cálculo</button>
                  <CopyToClipboardButton textToCopy={`CALCULAR RENDA PASSIVA\n\nhttps://calcularrendapassiva.com\n\nResultado:\nPrazo: ${periodo} meses\nInvestido: R$ ${valorInvestido}\nRendimentos: R$ ${rendimentosPeriodo}\nAcumulado: R$ ${valorAcumulado}\nTaxa Mensal: ${txPeriodo}%\nRenda Passiva: R$ ${renda}`
                  } />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <MarketingArea />

      <div className="text-center min-[203px]:hidden p-3">
        <p>Conteúdo disponível em dispositivos com tamanho a partir de 203 pixels</p>
      </div>

    </div >
  )
}


export default Home;