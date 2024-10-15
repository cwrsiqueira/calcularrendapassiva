// Formatar máscaras dos valores
$(".value").mask("000.000.000,00", { reverse: true });
$(".percent").mask("00,00", { reverse: true });

// Função de cálculo de Renda Passiva
function calcularRendaPassiva() {
  const periodo = document.getElementById("periodo").value;
  const txPeriodo = document.getElementById("txPeriodo").value;
  const valorInicial = document.getElementById("valorInicial").value;
  const valorRecorrente = document.getElementById("valorRecorrente").value;
  const rendaPassiva = document.getElementById("rendaPassiva").value;

  let camposPreenchidos = [
    periodo,
    valorInicial,
    valorRecorrente,
    txPeriodo,
    rendaPassiva,
  ];
  let totalCamposNPreenchidos = 0;
  let campoEmBranco = -1;

  camposPreenchidos.forEach((item, index) => {
    if (item === "") {
      totalCamposNPreenchidos++;
      campoEmBranco = index;
    }
  });

  if (totalCamposNPreenchidos !== 1) {
    alert("Deixe apenas um campo em branco para cálculo.");
    return;
  }

  function formatarValor(valor, sistema = true) {
    if (sistema) {
      return valor.replace(/\./g, "").replace(",", ".");
    } else {
      return valor
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  }

  function calcularAnosEMeses(totalMeses) {
    const anos = Math.floor(totalMeses / 12); // Calcula os anos inteiros
    const meses = totalMeses % 12; // Calcula os meses restantes

    if (meses == 0) {
      return `${anos} anos`;
    } else if (meses == 1) {
      return `${anos} anos e ${meses} mês`;
    }

    return `${anos} anos e ${meses} meses`;
  }

  let prazo = periodo ? periodo : 0,
    taxa = txPeriodo ? parseFloat(formatarValor(txPeriodo)) : 0,
    inicial = valorInicial ? parseFloat(formatarValor(valorInicial)) : 0,
    recorrente = valorRecorrente
      ? parseFloat(formatarValor(valorRecorrente))
      : 0,
    renda = rendaPassiva ? parseFloat(formatarValor(rendaPassiva)) : 0;

  switch (campoEmBranco) {
    case 0: // Calcular o prazo
      vlrAtual = inicial;
      montante = renda / (taxa / 100);
      loop = 0;
      continuar = true;

      while (continuar) {
        if (vlrAtual * (1 + taxa / 100) + recorrente < montante) {
          vlrAtual = vlrAtual * (1 + taxa / 100) + recorrente;
        } else {
          continuar = false;
        }
        loop++;
      }

      prazo = loop - 1;
      investido = inicial + recorrente * prazo;
      rendimentos = vlrAtual - (inicial + recorrente * prazo);
      acumulado = vlrAtual;
      renda = acumulado * (taxa / 100);
      break;
    case 1: // Calcular o valor inicial
      montante = renda / (taxa / 100);
      taxaAtualizada = Math.pow(1 + taxa / 100, prazo);
      recorrenteAtualizado = recorrente * ((taxaAtualizada - 1) / (taxa / 100));
      inicialAtualizado = montante - recorrenteAtualizado;

      inicial = inicialAtualizado / taxaAtualizada;
      investido = inicial + recorrente * prazo;
      rendimentos = montante - (inicial + recorrente * prazo);
      acumulado = montante;
      renda = acumulado * (taxa / 100);
      break;
    case 2: // Calcular o valor recorrente
      montante = renda / (taxa / 100);
      inicialAtualizado = inicial * Math.pow(1 + taxa / 100, prazo);
      taxaAtualizada = (Math.pow(1 + taxa / 100, prazo) - 1) / (taxa / 100);

      recorrente = parseFloat(
        ((montante - inicialAtualizado) / taxaAtualizada).toFixed(2)
      );
      investido = inicial + recorrente * prazo;
      rendimentos = montante - (inicial + recorrente * prazo);
      acumulado = montante;
      renda = acumulado * (taxa / 100);
      break;
    case 3: // Calcular a taxa
      t = 0.01;
      r = 0;
      n = prazo;
      cont = true;
      montante = 0;
      montanteAtualizado = 0;
      rendaAtualizada = 0;
      taxaAtualizada = 0;

      while (cont) {
        investInicialAtualizado = inicial * Math.pow(1 + t / 100, n);
        investRecorrenteAtualizado =
          recorrente * ((Math.pow(1 + t / 100, n) - 1) / (t / 100));
        montante = investInicialAtualizado + investRecorrenteAtualizado;
        r = montante * (t / 100);
        if (r >= renda) {
          cont = false;
        } else {
          rendaAtualizada = r;
          montanteAtualizado = montante;
          taxaAtualizada = t;
          t = t + 0.01;
          console.log(rendaAtualizada, montanteAtualizado, taxaAtualizada, t);
        }
      }

      taxa = taxaAtualizada;
      investido = inicial + recorrente * prazo;
      rendimentos = montanteAtualizado - (inicial + recorrente * prazo);
      acumulado = montanteAtualizado;
      renda = acumulado * (taxa / 100);
      break;
    case 4: // Calcular a renda passiva
      rentAtual = inicial * (1 + taxa / 100) + recorrente;
      for (i = 1; i < prazo; i++) {
        rentAtual = rentAtual * (1 + taxa / 100) + recorrente;
      }

      investido = inicial + recorrente * prazo;
      rendimentos = rentAtual - investido;
      acumulado = rentAtual;
      renda = acumulado * (taxa / 100);
      break;
  }

  if (
    investido == Infinity ||
    rendimentos == Infinity ||
    acumulado == Infinity ||
    renda == Infinity
  ) {
    alert(
      "Valores informados levam a resultados infinitos ou . Verifique os valores e tente novamente."
    );
    return false;
  }

  anosEMeses = calcularAnosEMeses(prazo);

  sessionStorage.setItem(
    "prazo",
    prazo ? prazo + " meses (ou " + anosEMeses + ")" : "N/A"
  );
  sessionStorage.setItem(
    "valorInicial",
    inicial ? formatarValor(inicial, false) : "N/A"
  );
  sessionStorage.setItem(
    "valorRecorrente",
    recorrente ? formatarValor(recorrente, false) : "N/A"
  );
  sessionStorage.setItem(
    "valorInvestido",
    investido ? formatarValor(investido, false) : "N/A"
  );
  sessionStorage.setItem(
    "rendimentos",
    rendimentos ? formatarValor(rendimentos, false) : "N/A"
  );
  sessionStorage.setItem("taxa", taxa ? formatarValor(taxa, false) : "N/A");
  sessionStorage.setItem(
    "rendaPassiva",
    renda ? formatarValor(renda, false) : "N/A"
  );
  sessionStorage.setItem(
    "valorAcumulado",
    acumulado ? formatarValor(acumulado, false) : "N/A"
  );

  window.location.href = "results.html";
}

// Adicionar eventos aos botões
if (document.getElementById("calcularBtn")) {
  document
    .getElementById("calcularBtn")
    .addEventListener("click", calcularRendaPassiva);
}

if (document.getElementById("resultPrazo")) {
  document.getElementById(
    "resultPrazo"
  ).textContent = `Prazo: ${sessionStorage.getItem("prazo")}`;
  document.getElementById(
    "resultValorInicial"
  ).textContent = `Valor Inicial: $ ${sessionStorage.getItem("valorInicial")}`;
  document.getElementById(
    "resultValorRecorrente"
  ).textContent = `Valor Recorrente: $ ${sessionStorage.getItem(
    "valorRecorrente"
  )}`;
  document.getElementById(
    "resultValorInvestido"
  ).textContent = `Valor Investido: $ ${sessionStorage.getItem(
    "valorInvestido"
  )}`;
  document.getElementById(
    "resultRendimentos"
  ).textContent = `Rendimentos: $ ${sessionStorage.getItem("rendimentos")}`;
  document.getElementById(
    "resultTaxa"
  ).textContent = `Taxa Mensal: ${sessionStorage.getItem("taxa")}%`;
  document.getElementById(
    "resultRendaPassiva"
  ).textContent = `Renda Passiva: $ ${sessionStorage.getItem("rendaPassiva")}`;
  document.getElementById(
    "resultValorAcumulado"
  ).textContent = `Valor Acumulado: $ ${sessionStorage.getItem(
    "valorAcumulado"
  )}`;
}

if (document.getElementById("copiarBtn")) {
  document.getElementById("copiarBtn").addEventListener("click", function () {
    const prazo = document.getElementById("resultPrazo").textContent;
    const valorInicial =
      document.getElementById("resultValorInicial").textContent;
    const valorRecorrente = document.getElementById(
      "resultValorRecorrente"
    ).textContent;
    const valorInvestido = document.getElementById(
      "resultValorInvestido"
    ).textContent;
    const valorRendimentos =
      document.getElementById("resultRendimentos").textContent;
    const taxa = document.getElementById("resultTaxa").textContent;
    const rendaPassiva =
      document.getElementById("resultRendaPassiva").textContent;
    const valorAcumulado = document.getElementById(
      "resultValorAcumulado"
    ).textContent;

    const resultado = `Calcular Renda Passiva
  https://www.calcularrendapassiva.com

  Resultados
  ${prazo}
  ${valorInicial}
  ${valorRecorrente}
  ${valorInvestido}
  ${valorRendimentos}
  ${valorAcumulado}
  ${taxa}
  ${rendaPassiva}
  `;

    navigator.clipboard
      .writeText(resultado)
      .then(() => {
        alert("Resultados copiados para a área de transferência!");
      })
      .catch((err) => {
        alert("Erro ao copiar os resultados. Tente novamente.");
        console.error("Erro ao copiar", err);
      });
  });
}
