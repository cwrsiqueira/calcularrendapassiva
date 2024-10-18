// Pega o offsetHeight do tamanho atual do card da calculadora
// e acrescenta a diferença como margin top do elemento abaixo.
const flipcardfront = document.querySelector(".flip-card-front").offsetHeight;
const botoesextras = document.querySelector(".botoes-extras");
botoesextras.style.marginTop = flipcardfront - 400 + "px";

// Formatar máscaras dos valores (para campos de input com valores monetários e percentuais)
$(".value").mask("000.000.000,00", { reverse: true }); // Formata o valor monetário com pontuação e vírgula (ex: 1.000,00)
$(".percent").mask("00,00", { reverse: true }); // Formata o valor percentual com vírgula (ex: 10,00%)

// Recupera valores previamente salvos no sessionStorage e preenche os campos correspondentes
document.getElementById("periodo").value =
  sessionStorage.getItem("periodo") ?? "";
document.getElementById("txPeriodo").value =
  sessionStorage.getItem("txPeriodo") ?? "";
document.getElementById("valorInicial").value =
  sessionStorage.getItem("valorInicial") ?? "";
document.getElementById("valorRecorrente").value =
  sessionStorage.getItem("valorRecorrente") ?? "";
document.getElementById("rendaPassiva").value =
  sessionStorage.getItem("rendaPassiva") ?? "";

// Limpar o Session Storage ao clicar no botão de reset
document.querySelector("#btn-reset").addEventListener("click", function () {
  sessionStorage.clear(); // Limpa todos os dados do sessionStorage
});

// Função de cálculo de Renda Passiva
function calcularRendaPassiva() {
  // Captura os valores inseridos pelo usuário
  const periodo = document.getElementById("periodo").value;
  const txPeriodo = document.getElementById("txPeriodo").value;
  const valorInicial = document.getElementById("valorInicial").value;
  const valorRecorrente = document.getElementById("valorRecorrente").value;
  const rendaPassiva = document.getElementById("rendaPassiva").value;

  // Salva os valores no sessionStorage para manter as informações na página
  sessionStorage.setItem("periodo", periodo);
  sessionStorage.setItem("txPeriodo", txPeriodo);
  sessionStorage.setItem("valorInicial", valorInicial);
  sessionStorage.setItem("valorRecorrente", valorRecorrente);
  sessionStorage.setItem("rendaPassiva", rendaPassiva);

  // Array que contém os campos preenchidos pelo usuário
  let camposPreenchidos = [
    periodo,
    valorInicial,
    valorRecorrente,
    txPeriodo,
    rendaPassiva,
  ];
  let totalCamposNPreenchidos = 0;
  let campoEmBranco = -1; // Variável para identificar o campo em branco

  // Verifica quais campos estão vazios
  camposPreenchidos.forEach((item, index) => {
    if (item === "") {
      totalCamposNPreenchidos++;
      campoEmBranco = index; // Guarda o índice do campo que está vazio
    }
  });

  // Se houver mais de um campo em branco, alerta o usuário
  if (totalCamposNPreenchidos !== 1) {
    alert("Deixe apenas um campo em branco para cálculo.");
    return;
  }

  // Função para formatar valores (de acordo com o sistema utilizado - true para formato internacional 1,000.00)
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

  // Função para calcular o tempo em anos e meses
  function calcularAnosEMeses(totalMeses) {
    const anos = Math.floor(totalMeses / 12); // Calcula os anos inteiros
    const meses = totalMeses % 12; // Calcula os meses restantes

    const anoTexto = anos === 1 ? "1 ano" : `${anos} anos`; // Plural e singular para "ano"
    const mesTexto = meses === 1 ? "1 mês" : `${meses} meses`; // Plural e singular para "mês"

    // Se for menos de 1 ano, retorna apenas os meses
    if (anos === 0) {
      return mesTexto; // Retorna apenas meses
    }

    // Se os meses forem 0, retorna apenas os anos
    if (meses === 0) {
      return `${totalMeses} meses (ou ${anoTexto})`; // Exemplo: "12 meses (ou 1 ano)"
    }

    // Retorna no formato "X meses (ou X anos e X meses)"
    return `${totalMeses} meses (ou ${anoTexto} e ${mesTexto})`; // Exemplo: "13 meses (ou 1 ano e 1 mês)"
  }

  // Conversão e cálculo dos valores
  let prazo = periodo ? periodo : 0,
    taxa = txPeriodo ? parseFloat(formatarValor(txPeriodo)) : 0,
    inicial = valorInicial ? parseFloat(formatarValor(valorInicial)) : 0,
    recorrente = valorRecorrente
      ? parseFloat(formatarValor(valorRecorrente))
      : 0,
    renda = rendaPassiva ? parseFloat(formatarValor(rendaPassiva)) : 0;

  // Cálculo baseado no campo vazio identificado
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

  // Validações para evitar resultados infinitos
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

  // Chama a função calcularAnosEMeses para formatar o prazo em anos e meses
  anosEMeses = calcularAnosEMeses(prazo);

  // Salva os resultados no sessionStorage
  sessionStorage.setItem("prazo", prazo ? anosEMeses : "N/A");
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

  // Animação para "virar o cartão" e mostrar os resultados
  document.querySelector(".flip-card").classList.add("flip-card-flipped");

  // Redireciona para a página de resultados
  setTimeout(() => {
    window.location.href = "results.html";
  }, 500);
}

// Função para voltar ao formulário inicial
function voltarFormulario(e) {
  e.preventDefault(); // Previne o comportamento padrão do botão
  document.querySelector(".flip-card").classList.remove("flip-card-flipped"); // Reverte a animação do cartão
  setTimeout(() => {
    window.location.href = "/"; // Redireciona para a página inicial
  }, 500);
}

// Adiciona eventos aos botões de calcular e voltar
document
  .getElementById("calcularBtn")
  .addEventListener("click", calcularRendaPassiva);

if (document.getElementById("voltarBtn")) {
  document
    .getElementById("voltarBtn")
    .addEventListener("click", voltarFormulario);
}

// Verifica se a página de resultados está acessada diretamente sem cálculo
currentPage = window.location.pathname.split("/").pop(); // Pega a última parte da URL /index.html, /results.html etc.
if (currentPage == "results.html" && !sessionStorage.getItem("rendaPassiva")) {
  window.location.href = "/"; // Redireciona para o início se não houver dados calculados
}

if (document.getElementById("resultPrazo")) {
  // Exibe os resultados na página de resultados
  document.getElementById("resultPrazo").textContent = `Prazo: ${
    sessionStorage.getItem("prazo") || "---"
  }`;
  document.getElementById(
    "resultValorInicial"
  ).textContent = `Valor Inicial: $ ${
    sessionStorage.getItem("valorInicial") || "---"
  }`;
  document.getElementById(
    "resultValorRecorrente"
  ).textContent = `Valor Recorrente: $ ${
    sessionStorage.getItem("valorRecorrente") || "---"
  }`;
  document.getElementById(
    "resultValorInvestido"
  ).textContent = `Valor Investido: $ ${
    sessionStorage.getItem("valorInvestido") || "---"
  }`;
  document.getElementById("resultRendimentos").textContent = `Rendimentos: $ ${
    sessionStorage.getItem("rendimentos") || "---"
  }`;
  document.getElementById("resultTaxa").textContent = `Taxa Mensal: ${
    sessionStorage.getItem("taxa") || "---"
  }%`;
  document.getElementById(
    "resultRendaPassiva"
  ).textContent = `Renda Passiva: $ ${
    sessionStorage.getItem("rendaPassiva") || "---"
  }`;
  document.getElementById(
    "resultValorAcumulado"
  ).textContent = `Valor Acumulado: $ ${
    sessionStorage.getItem("valorAcumulado") || "---"
  }`;
}

if (document.getElementById("copiarBtn")) {
  // Função para copiar os resultados
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

    // Formata o resultado para ser copiado
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

    // Copia o texto para a área de transferência e alerta o usuário
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
