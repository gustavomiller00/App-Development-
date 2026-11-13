
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. CONFIGURAÇÕES E DADOS
    // ==========================================

    const STORAGE_KEY = "medidorSinistroEquipamentos";
    const TARIFA_KEY = "medidorSinistroTarifa";

    let tarifa = Number(localStorage.getItem(TARIFA_KEY)) || 0.95;

    let equipamentos = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const hoje = new Date();
    const diasNoMes = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0
    ).getDate();

    const formatar = (valor) =>
        Number(valor).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const moeda = (valor) =>
        valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    const salvar = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(equipamentos)
        );

        localStorage.setItem(TARIFA_KEY, tarifa);
    };

    const equipamentosAtivos = () =>
        equipamentos.filter(equip => equip.ativo);

    // ==========================================
    // 2. CÁLCULOS DE CONSUMO
    // ==========================================

    function consumoDiario(equip) {
        return (equip.potencia / 1000) * equip.horas;
    }

    function consumoMensal(equip) {
        return consumoDiario(equip) * diasNoMes;
    }

    function consumoTotalDiario() {
        return equipamentosAtivos().reduce(
            (total, equip) => total + consumoDiario(equip),
            0
        );
    }

    function consumoTotalMensal() {
        return equipamentosAtivos().reduce(
            (total, equip) => total + consumoMensal(equip),
            0
        );
    }

    function potenciaTotal() {
        return equipamentosAtivos().reduce(
            (total, equip) => total + equip.potencia,
            0
        );
    }

    // ==========================================
    // 3. ATUALIZAR DASHBOARD
    // ==========================================

    function atualizarDashboard() {

        const mensal = consumoTotalMensal();
        const diario = consumoTotalDiario();
        const ativos = equipamentosAtivos().length;
        const custo = mensal * tarifa;

        document.getElementById("mensal-consum").textContent =
            `${formatar(mensal)} kWh`;

        document.getElementById("mensal-consum2").textContent =
            `${formatar(mensal)} kWh`;

        document.getElementById("custo-estim").textContent =
            moeda(custo);

        document.getElementById("ativ-equips").textContent =
            ativos.toString().padStart(2, "0");

        document.getElementById("atual-tarif").textContent =
            `${moeda(tarifa)}/kWh`;

        // Informações complementares dos cards

        const textosCards = document.querySelectorAll(
            ".top-cards .divide a:last-child"
        );

        if (textosCards.length >= 3) {
            textosCards[0].textContent =
                `${formatar(diario)} kWh por dia`;

            textosCards[1].textContent =
                `Tarifa: ${moeda(tarifa)}/kWh`;

            textosCards[2].textContent =
                `${equipamentos.length - ativos} desligados`;
        }

        // Informações importantes

        const maiores = [...equipamentosAtivos()]
            .sort((a, b) => consumoMensal(b) - consumoMensal(a));

        const textos = document.querySelectorAll(
            ".graphics-card-text"
        );

        const infos = [
            `Consumo diário: ${formatar(diario)} kWh`,
            `Consumo mensal: ${formatar(mensal)} kWh`,
            `Potência instalada: ${formatar(potenciaTotal() / 1000)} kW`
        ];

        textos.forEach((elemento, indice) => {
            if (infos[indice]) {
                elemento.textContent = infos[indice];
            }
        });

        const informacoesMobile = document.querySelectorAll(
            ".dash-card-var a"
        );

        informacoesMobile.forEach((elemento, indice) => {
            if (infos[indice]) {
                elemento.textContent = infos[indice];
            }
        });

        const textosConsumo = [
            `Maior consumidor: ${maiores[0]?.nome || "Nenhum"}`,
            `Consumo: ${formatar(maiores[0] ? consumoMensal(maiores[0]) : 0)} kWh/mês`,
            `Custo: ${moeda(maiores[0] ? consumoMensal(maiores[0]) * tarifa : 0)}`
        ];

        document.querySelectorAll(
            ".template-consume-text a"
        ).forEach((elemento, indice) => {
            elemento.textContent = textosConsumo[indice];
        });

        renderizarEquipamentos();
        atualizarMaioresConsumidores();
        atualizarGraficos();
    }

    // ==========================================
    // 4. ADICIONAR EQUIPAMENTOS
    // ==========================================

    function adicionarEquipamento() {

        const nome = prompt("Nome do equipamento:");

        if (!nome || !nome.trim()) return;

        const potencia = Number(
            prompt("Potência do equipamento em Watts (W):")
                ?.replace(",", ".")
        );

        if (!Number.isFinite(potencia) || potencia <= 0) {
            alert("Informe uma potência válida.");
            return;
        }

        const horas = Number(
            prompt("Quantas horas por dia ele funciona?")
                ?.replace(",", ".")
        );

        if (!Number.isFinite(horas) || horas <= 0 || horas > 24) {
            alert("Informe um tempo entre 0 e 24 horas.");
            return;
        }

        const horario = Number(
            prompt("Horário de início da utilização (0 a 23):", "8")
        );

        if (
            !Number.isInteger(horario) ||
            horario < 0 ||
            horario > 23
        ) {
            alert("Informe um horário válido entre 0 e 23.");
            return;
        }

        const equipamento = {
            id: Date.now(),
            nome: nome.trim(),
            potencia,
            horas,
            horario,
            ativo: true
        };

        equipamentos.push(equipamento);

        salvar();
        atualizarDashboard();

        alert(`${nome} cadastrado com sucesso!`);
    }

    // ==========================================
    // 5. BOTÕES DE ADICIONAR
    // ==========================================

    document.getElementById("add-equip")
        ?.addEventListener("click", adicionarEquipamento);

    document.getElementById("add-equip-out")
        ?.addEventListener("click", adicionarEquipamento);

    // ==========================================
    // 6. CADASTRO DE EQUIPAMENTOS NA TELA
    // ==========================================

    function renderizarEquipamentos() {

        const secao = document.getElementById("Equips");

        if (!secao) return;

        secao.innerHTML = `
            <div class="lista-equipamentos">
                <h2>Meus equipamentos</h2>

                <p>Gerencie seus aparelhos e acompanhe o consumo.</p>

                <div id="listaEquipamentos"></div>
            </div>
        `;

        const lista = document.getElementById("listaEquipamentos");

        if (equipamentos.length === 0) {
            lista.innerHTML = `
                <p>Nenhum equipamento cadastrado.</p>
                <p>Utilize o botão Adicionar para começar.</p>
            `;
            return;
        }

        equipamentos.forEach(equip => {

            const consumo = consumoMensal(equip);
            const custo = consumo * tarifa;

            const item = document.createElement("div");

            item.className = "equipamento-item";

            item.innerHTML = `
                <div>
                    <strong class="nome-equipamento"></strong>
                    <p>${equip.potencia} W | ${equip.horas} horas/dia</p>
                    <p>${formatar(consumo)} kWh/mês</p>
                    <p>${moeda(custo)}/mês</p>
                </div>

                <div class="acoes-equipamento">
                    <button class="alternar-equip">
                        ${equip.ativo ? "Desligar" : "Ligar"}
                    </button>

                    <button class="remover-equip">
                        Excluir
                    </button>
                </div>
            `;

            // Evita inserir o nome diretamente como HTML.
            item.querySelector(".nome-equipamento").textContent =
                equip.nome;

            item.querySelector(".alternar-equip")
                .addEventListener("click", () => {

                    equip.ativo = !equip.ativo;

                    salvar();
                    atualizarDashboard();
                });

            item.querySelector(".remover-equip")
                .addEventListener("click", () => {

                    if (!confirm(`Excluir ${equip.nome}?`)) return;

                    equipamentos = equipamentos.filter(
                        e => e.id !== equip.id
                    );

                    salvar();
                    atualizarDashboard();
                });

            lista.appendChild(item);
        });
    }

    // ==========================================
    // 7. MAIORES CONSUMIDORES
    // ==========================================

    function atualizarMaioresConsumidores() {

        const maiores = [...equipamentosAtivos()]
            .sort((a, b) => consumoMensal(b) - consumoMensal(a))
            .slice(0, 4);

        for (let i = 0; i < 4; i++) {

            const card = document.getElementById(`eletro${i + 1}`);

            if (!card) continue;

            const nome = card.querySelector(".eletro-name");
            const consumo = card.querySelector(".eletro-consume");

            if (maiores[i]) {
                nome.textContent = maiores[i].nome;

                consumo.textContent =
                    `${formatar(consumoMensal(maiores[i]))} kWh`;
                
                card.style.display = "flex";

            } else {
                card.style.display = "none";
            }
        }
    }

    // ==========================================
    // 8. TARIFA DE ENERGIA
    // ==========================================

    document.getElementById("atual-tarif")
        ?.addEventListener("click", () => {

            const novaTarifa = Number(
                prompt(
                    "Informe sua tarifa de energia em R$/kWh:",
                    tarifa.toString()
                )?.replace(",", ".")
            );

            if (!Number.isFinite(novaTarifa) || novaTarifa <= 0) {
                alert("Informe uma tarifa válida.");
                return;
            }

            tarifa = novaTarifa;

            salvar();
            atualizarDashboard();
        });

    // ==========================================
    // 9. DADOS DOS GRÁFICOS
    // ==========================================

    const horarios = Array.from(
        { length: 24 },
        (_, hora) => `${String(hora).padStart(2, "0")}h`
    );

    function calcularPotenciaPorHorario() {

        return horarios.map((_, hora) => {

            return equipamentosAtivos().reduce(
                (total, equip) => {

                    const horaFinal = equip.horario + equip.horas;
                    const horaAjustada = hora < equip.horario
                        ? hora + 24
                        : hora;

                    const estaLigado =
                        horaAjustada >= equip.horario &&
                        horaAjustada < horaFinal;

                    return total + (
                        estaLigado ? equip.potencia / 1000 : 0
                    );

                },
                0
            );
        });
    }

    const dias = Array.from(
        { length: diasNoMes },
        (_, i) => String(i + 1).padStart(2, "0")
    );

    function calcularConsumoPorDia() {
        return dias.map(() => consumoTotalDiario());
    }

    const media = valores =>
        valores.length
            ? valores.reduce((a, b) => a + b, 0) / valores.length
            : 0;

    const numero = formatar;

    // ==========================================
    // 10. CONFIGURAÇÃO DO CHART.JS
    // ==========================================

    Chart.defaults.font.family = "Outfit, Arial";
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
    // 11. GRÁFICO DE POTÊNCIA DIÁRIA
    // ==========================================

    const valoresHoje = calcularPotenciaPorHorario();

    const graficoHoje = new Chart(
        document.getElementById("graficoHoje"),
        {
            type: "line",

            data: {
                labels: horarios,

                datasets: [{
                    label: "Potência estimada",
                    data: valoresHoje,

                    borderColor: "#2583f7",
                    backgroundColor: "rgba(37,131,247,0.12)",

                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,

                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#2583f7"
                }]
            },

            options: {
                ...opcoesComuns,

                animation: {
                    duration: 1200,
                    easing: "easeInOutQuart"
                },

                onClick: (evento, elementos) => {

                    if (!elementos.length) return;

                    const indice = elementos[0].index;
                    const potencia = calcularPotenciaPorHorario()[indice];

                    document.getElementById("detalhesHoje").innerHTML = `
                        <strong>Potência às ${horarios[indice]}</strong>
                        <p>Potência estimada: ${numero(potencia)} kW.</p>
                    `;
                },

                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { maxTicksLimit: 8 }
                    },

                    y: {
                        beginAtZero: true,

                        title: {
                            display: true,
                            text: "kW"
                        },

                        grid: {
                            color: "rgba(255,255,255,0.08)"
                        },

                        border: { display: false }
                    }
                }
            }
        }
    );

    // ==========================================
    // 12. GRÁFICO DE CONSUMO MENSAL
    // ==========================================

    const graficoMes = new Chart(
        document.getElementById("graficoMes"),
        {
            type: "bar",

            data: {
                labels: dias,

                datasets: [{
                    label: "Consumo",
                    data: calcularConsumoPorDia(),

                    backgroundColor: "#75aaf8",
                    borderRadius: 5,
                    maxBarThickness: 18
                }]
            },

            options: {
                ...opcoesComuns,

                animation: {
                    duration: 800,
                    easing: "easeOutQuart"
                },

                onClick: (evento, elementos) => {

                    if (!elementos.length) return;

                    const indice = elementos[0].index;
                    const consumo = calcularConsumoPorDia()[indice];

                    document.getElementById("detalhesMes").innerHTML = `
                        <strong>Dia ${dias[indice]} do mês</strong>
                        <p>Consumo estimado: ${numero(consumo)} kWh.</p>
                        <p>Custo estimado: ${moeda(consumo * tarifa)}.</p>
                    `;
                },

                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { maxTicksLimit: 8 }
                    },

                    y: {
                        beginAtZero: true,

                        title: {
                            display: true,
                            text: "kWh"
                        },

                        grid: {
                            color: "rgba(255,255,255,0.08)"
                        },

                        border: { display: false }
                    }
                }
            }
        }
    );

    // ==========================================
    // 13. ATUALIZAR GRÁFICOS
    // ==========================================

    function atualizarGraficos() {

        const potencias = calcularPotenciaPorHorario();
        const consumos = calcularConsumoPorDia();

        graficoHoje.data.datasets[0].data = potencias;
        graficoMes.data.datasets[0].data = consumos;

        graficoHoje.update();
        graficoMes.update();

        const mediaPotencia = media(potencias);
        const picoPotencia = Math.max(0, ...potencias);

        const mediaConsumo = media(consumos);
        const picoConsumo = Math.max(0, ...consumos);

        document.getElementById("mediaHoje").innerHTML =
            `${numero(mediaPotencia)} <small class="unidade">kW</small>`;

        document.getElementById("picoHoje").innerHTML =
            `${numero(picoPotencia)} <small class="unidade">kW</small>`;

        document.getElementById("mediaMes").innerHTML =
            `${numero(mediaConsumo)} <small class="unidade">kWh</small>`;

        document.getElementById("picoMes").innerHTML =
            `${numero(picoConsumo)} <small class="unidade">kWh</small>`;
    }

    
    // ==========================================
    // 14. GRÁFICOS DE DISTRIBUIÇÃO (DONUT)
    // ==========================================

    let graficoDistribuicao;
    let graficoDistribuicao2;


    // PRIMEIRO GRÁFICO
    function atualizarGraficoDistribuicao() {

        const canvas = document.getElementById("graficoDistribuicao");

        if (!canvas || typeof Chart === "undefined") return;

        const equipamentos = JSON.parse(
            localStorage.getItem("medidorSinistroEquipamentos") || "[]"
        );

        const equipamentosAtivos = equipamentos.filter(e => e.ativo);

        const nomes = equipamentosAtivos.map(e => e.nome);

        const consumos = equipamentosAtivos.map(e =>
            (Number(e.potencia) / 1000) * Number(e.horas)
        );

        if (graficoDistribuicao) {
            graficoDistribuicao.destroy();
        }

        graficoDistribuicao = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: nomes,

                datasets: [{
                    data: consumos,

                    backgroundColor: [
                        "#002396",
                        "#5f8800",
                        "#00c08a",
                        "#c78500",
                        "#8d0000",
                        "#5d0088",
                        "#0b8500"
                    ],

                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "72%",

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${
                                    context.raw.toFixed(2)
                                } kWh/dia`;
                            }
                        }
                    }
                }
            }
        });
    }


    // SEGUNDO GRÁFICO
    function atualizarGraficoDistribuicao2() {

        const canvas = document.getElementById("graficoDistribuicao2");

        if (!canvas || typeof Chart === "undefined") return;

        const equipamentos = JSON.parse(
            localStorage.getItem("medidorSinistroEquipamentos") || "[]"
        );

        const equipamentosAtivos = equipamentos.filter(e => e.ativo);

        const nomes = equipamentosAtivos.map(e => e.nome);

        const consumos = equipamentosAtivos.map(e =>
            (Number(e.potencia) / 1000) * Number(e.horas)
        );

        if (graficoDistribuicao2) {
            graficoDistribuicao2.destroy();
        }

        graficoDistribuicao2 = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: nomes,

                datasets: [{
                    data: consumos,

                    backgroundColor: [
                        "#002396",
                        "#5f8800",
                        "#00c08a",
                        "#c78500",
                        "#8d0000",
                        "#5d0088",
                        "#0b8500"
                    ],

                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "72%",

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${
                                    context.raw.toFixed(2)
                                } kWh/dia`;
                            }
                        }
                    }
                }
            }
        });
    }


    
    // ==========================================
    // 15. NAVEGAÇÃO ENTRE GRÁFICOS
    // ==========================================

    const widget = document.getElementById("widgetEnergia");
    const telas = document.querySelectorAll("#widgetEnergia .tela");
    const pontos = document.querySelectorAll("#widgetEnergia .ponto");

    let telaAtual = 0;

    function mostrarTela(indice) {

        telaAtual = Math.max(0, Math.min(1, indice));

        telas.forEach((tela, i) => {
            tela.classList.toggle("ativa", i === telaAtual);
        });

        pontos.forEach((ponto, i) => {
            ponto.classList.toggle("ativo", i === telaAtual);
        });

        const titulo = document.getElementById("titulo");
        const subtitulo = document.getElementById("subtitulo");

        if (titulo) {
            titulo.textContent =
                telaAtual === 0
                    ? "Potência de hoje"
                    : "Consumo do mês";
        }

        if (subtitulo) {
            subtitulo.textContent =
                telaAtual === 0
                    ? "Acompanhe a potência ao longo do dia"
                    : "Compare o consumo diário";
        }

        setTimeout(() => {
            if (typeof graficoHoje !== "undefined") {
                graficoHoje.resize();
            }

            if (typeof graficoMes !== "undefined") {
                graficoMes.resize();
            }
        }, 100);
    }

    pontos.forEach(ponto => {
        ponto.addEventListener("click", () => {
            mostrarTela(Number(ponto.dataset.tela));
        });
    });


    // ==========================================
    // 15.1 DESLIZAR ENTRE OS GRÁFICOS
    // ==========================================

    let inicioX = 0;
    let inicioY = 0;

    if (widget) {

        widget.addEventListener("touchstart", evento => {

            inicioX = evento.touches[0].clientX;
            inicioY = evento.touches[0].clientY;

        }, { passive: true });

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

        }, { passive: true });
    }


    // ==========================================
    // 16. INICIALIZAÇÃO
    // ==========================================

    salvar();
    atualizarDashboard();

    atualizarGraficoDistribuicao();
    atualizarGraficoDistribuicao2();

    mostrarTela(0);

});
