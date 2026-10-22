


document.querySelector('.menu').addEventListener('dragstart', (event) => {
    event.preventDefault();
});












































// GRÁFICOS: 


// DADOS DE EXEMPLO
const horarios = ["00h", "04h", "06h", "08h", "10h", "12h", "14h", "16h", "18h", "21h"];
const potencias = [0.2, 0.2, 0.4, 1.8, 5.2, 7.8, 6.9, 3.5, 0.8, 0.7, 0.6];

const dias = [
  "01", "02", "03", "04", "05", "06", "07",
  "08", "09", "10", "11", "12", "13", "14",
  "15", "16", "17", "18", "19", "20", "21",
  "22", "23", "24", "25", "26", "27", "28",
  "29", "30", "31"
];

const consumos = [
  15, 18, 17, 21, 19, 16, 20,
  22, 18, 17, 25, 19, 16, 20,
  21, 18, 24, 19, 17, 20, 22,
  18, 16, 21, 19, 17, 20, 18,
  22, 19, 18
];

// FUNÇÕES AUXILIARES
const media = valores =>
  valores.reduce((total, valor) => total + valor, 0) / valores.length;

const numero = valor =>
  valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

// CÁLCULOS
const mediaPotencia = media(potencias);
const picoPotencia = Math.max(...potencias);
const mediaConsumo = media(consumos);
const picoConsumo = Math.max(...consumos);
const diaPico = consumos.indexOf(picoConsumo);

// ATUALIZA OS INDICADORES
document.getElementById("mediaHoje").innerHTML =
  `${numero(mediaPotencia)} <small class="unidade">kWp</small>`;

document.getElementById("picoHoje").innerHTML =
  `${numero(picoPotencia)} <small class="unidade">kWp</small>`;

document.getElementById("mediaMes").innerHTML =
  `${numero(mediaConsumo)} <small class="unidade">kWh</small>`;

document.getElementById("picoMes").innerHTML =
  `${numero(picoConsumo)} <small class="unidade">kWh</small>`;

// CONFIGURAÇÕES GERAIS DO CHART.JS
Chart.defaults.font.family = "Arial";
Chart.defaults.color = "#858995";

const opcoesComuns = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    intersect: true,
    mode: "nearest"
  },

  plugins: {
    legend: {
      display: false
    },

    tooltip: {
      backgroundColor: "#202124",
      padding: 12,
      cornerRadius: 10
    }
  }
};

// ==========================================
// PLUGIN DE ANIMAÇÃO DA LINHA
// ==========================================

const animacaoLinha = {
  id: "animacaoLinha",

  beforeDatasetsDraw(chart) {
    if (chart.options.plugins.animacaoLinha !== true) return;

    const area = chart.chartArea;
    if (!area) return;

    const ctx = chart.ctx;
    const progresso = chart.$progressoLinha ?? 0;

    ctx.save();
    ctx.beginPath();

    ctx.rect(
      area.left,
      area.top,
      (area.right - area.left) * progresso,
      area.bottom - area.top
    );

    ctx.clip();
  },

  afterDatasetsDraw(chart) {
    if (chart.options.plugins.animacaoLinha !== true) return;
    if (!chart.chartArea) return;

    chart.ctx.restore();
  }
};

Chart.register(animacaoLinha);

// ==========================================
// GRÁFICO 1 — LINHA: POTÊNCIA DO DIA
// ==========================================

const canvasHoje = document.getElementById("graficoHoje");

const graficoHoje = new Chart(canvasHoje, {
  type: "line",

  data: {
    labels: horarios,

    datasets: [{
      label: "Potência",
      data: potencias,

      borderColor: "#2583f7",
      backgroundColor: "rgba(37,131,247,0.12)",

      fill: true,
      tension: 0.35,
      borderWidth: 3,

      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: "#2583f7"
    }]
  },

  options: {
    ...opcoesComuns,

    animation: false,

    plugins: {
      ...opcoesComuns.plugins,
      animacaoLinha: true
    },

    onClick: (evento, elementos) => {
      if (!elementos.length) return;

      const indice = elementos[0].index;
      const horario = horarios[indice];
      const potencia = potencias[indice];

      document.getElementById("detalhesHoje").innerHTML = `
        <strong>Potência às ${horario}</strong>
        <p>
          Potência registrada: ${numero(potencia)} kWp.
          ${
            potencia === picoPotencia
              ? "Este é o pico de potência registrado nos dados."
              : `Diferença para o pico: ${numero(picoPotencia - potencia)} kWp.`
          }
        </p>
      `;
    },

    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },

      y: {
        beginAtZero: true,

        title: {
          display: true,
          text: "kWp"
        },

        grid: {
          color: "#edf0f5"
        },

        border: {
          display: false
        }
      }
    }
  }
});

// ==========================================
// ANIMAÇÃO DA LINHA — Coloquei 900 Milisegundos
// ==========================================

let quadroAnimacaoLinha;

function animarLinha() {
  if (quadroAnimacaoLinha) {
    cancelAnimationFrame(quadroAnimacaoLinha);
  }

  const duracao = 900;
  const inicio = performance.now();

  graficoHoje.$progressoLinha = 0;
  graficoHoje.draw();

  function desenhar(agora) {
    const progresso = Math.min(
      (agora - inicio) / duracao,
      1
    );

    graficoHoje.$progressoLinha = progresso;
    graficoHoje.draw();

    if (progresso < 1) {
      quadroAnimacaoLinha = requestAnimationFrame(desenhar);
    } else {
      quadroAnimacaoLinha = null;
    }
  }

  quadroAnimacaoLinha = requestAnimationFrame(desenhar);
}

// Anima ao abrir a página.
animarLinha();

// ==========================================
// GRÁFICO 2 — BARRAS: CONSUMO DO MÊS
// ==========================================

const graficoMes = new Chart(
  document.getElementById("graficoMes"),
  {
    type: "bar",

    data: {
      labels: dias,

      datasets: [{
        label: "Consumo",
        data: consumos.map(() => 0),

        backgroundColor: consumos.map((valor, indice) =>
          indice === diaPico ? "#145ac5" : "#75aaf8"
        ),

        borderRadius: 5,
        maxBarThickness: 18
      }]
    },

    options: {
      ...opcoesComuns,

      animation: {
        duration: 500,
        easing: "easeOutQuart",

        delay: ctx => {
          if (ctx.type === "data" && ctx.mode === "default") {
            return ctx.dataIndex * 45;
          }

          return 0;
        }
      },

      onClick: (evento, elementos) => {
        if (!elementos.length) return;

        const indice = elementos[0].index;
        const consumo = consumos[indice];
        const diferenca = consumo - mediaConsumo;

        document.getElementById("detalhesMes").innerHTML = `
          <strong>Dia ${dias[indice]} do mês</strong>
          <p>
            Consumo: ${numero(consumo)} kWh.
            ${
              indice === diaPico
                ? "Este foi o dia de maior consumo nos dados."
                : diferenca > 0
                  ? `${numero(diferenca)} kWh acima da média diária.`
                  : diferenca < 0
                    ? `${numero(Math.abs(diferenca))} kWh abaixo da média diária.`
                    : "Consumo igual à média diária."
            }
          </p>
        `;
      },

      scales: {
        x: {
          grid: {
            display: false
          },

          border: {
            display: false
          },

          ticks: {
            maxTicksLimit: 8
          }
        },

        y: {
          beginAtZero: true,

          title: {
            display: true,
            text: "kWh"
          },

          grid: {
            color: "#edf0f5"
          },

          border: {
            display: false
          }
        }
      }
    }
  }
);

// ==========================================
// NAVEGAÇÃO ENTRE OS GRÁFICOS
// ==========================================

const widget = document.getElementById("widgetEnergia");
const telas = document.querySelectorAll(".tela");
const pontos = document.querySelectorAll(".ponto");

let telaAtual = 0;

let temporizadorEntrada;
let temporizadorAnimacao;

function mostrarTela(indice) {
  const telaAnterior = telaAtual;

  telaAtual = Math.max(0, Math.min(1, indice));

  telas.forEach((tela, i) => {
    tela.classList.toggle("ativa", i === telaAtual);
  });

  pontos.forEach((ponto, i) => {
    ponto.classList.toggle("ativo", i === telaAtual);
  });

  document.getElementById("titulo").textContent =
    telaAtual === 0
      ? "Potência de hoje"
      : "Consumo do mês";

  document.getElementById("subtitulo").textContent =
    telaAtual === 0
      ? "Acompanhe a potência ao longo do dia"
      : "Compare o consumo diário";

  clearTimeout(temporizadorEntrada);
  clearTimeout(temporizadorAnimacao);

  temporizadorEntrada = setTimeout(() => {
    graficoHoje.resize();
    graficoMes.resize();

    // REANIMA A LINHA AO VOLTAR PARA ELA
    if (telaAtual === 0 && telaAnterior !== 0) {
      animarLinha();
    }

    // ANIMA AS BARRAS AO ENTRAR NA TELA MENSAL
    if (telaAtual === 1 && telaAnterior !== 1) {
      graficoMes.stop();

      graficoMes.data.datasets[0].data =
        consumos.map(() => 0);

      graficoMes.update("none");

      temporizadorAnimacao = setTimeout(() => {
        if (telaAtual !== 1) return;

        graficoMes.data.datasets[0].data = [...consumos];
        graficoMes.update();
      }, 200);
    }
  }, 50);
}

// CLIQUE NOS INDICADORES
pontos.forEach(ponto => {
  ponto.addEventListener("click", () => {
    mostrarTela(Number(ponto.dataset.tela));
  });
});

// ==========================================
// GESTO DE ARRASTAR NO CELULAR
// ==========================================

let inicioX = 0;
let inicioY = 0;

widget.addEventListener("touchstart", evento => {
  inicioX = evento.touches[0].clientX;
  inicioY = evento.touches[0].clientY;
}, {
  passive: true
});

widget.addEventListener("touchend", evento => {
  const fimX = evento.changedTouches[0].clientX;
  const fimY = evento.changedTouches[0].clientY;

  const distanciaX = fimX - inicioX;
  const distanciaY = fimY - inicioY;

  if (Math.abs(distanciaX) < 60) return;
  if (Math.abs(distanciaX) < Math.abs(distanciaY)) return;

  mostrarTela(
    telaAtual + (distanciaX < 0 ? 1 : -1)
  );
}, {
  passive: true
});
