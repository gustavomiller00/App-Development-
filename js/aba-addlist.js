
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. ELEMENTOS DO FORMULÁRIO
    // ==========================================

    const nome = document.getElementById("nomeEquipamento");
    const potencia = document.getElementById("potenciaEquipamento");
    const horas = document.getElementById("horasPorDia");
    const horario = document.getElementById("horarioInicio");

    const btnAdicionar = document.getElementById("btnAdicionarCriando");

    let iconeSelecionado = "icon1";

    // ==========================================
    // 2. SELEÇÃO DE ÍCONES
    // ==========================================

    const opcoesIcones = document.querySelectorAll(".icon-option");

    opcoesIcones.forEach(opcao => {

        opcao.addEventListener("click", evento => {

            evento.preventDefault();

            opcoesIcones.forEach(item => {
                item.classList.remove("selecionado");
                item.setAttribute("aria-pressed", "false");
            });

            opcao.classList.add("selecionado");
            opcao.setAttribute("aria-pressed", "true");

            iconeSelecionado = opcao.dataset.icon;

        });

    });

    // Ícone padrão

    const primeiroIcone = document.querySelector('[data-icon="icon1"]');

    if (primeiroIcone) {
        primeiroIcone.classList.add("selecionado");
        primeiroIcone.setAttribute("aria-pressed", "true");
    }

    // ==========================================
    // 3. FECHAR MODAL
    // ==========================================

    document.querySelectorAll(".fecharModal").forEach(botao => {

        botao.addEventListener("click", () => {

            window.parent.postMessage(
                { tipo: "fechar-modal" },
                window.location.origin
            );

        });

    });

    // ==========================================
    // 4. VALIDAR FORMULÁRIO
    // ==========================================

    function validarFormulario() {

        if (!nome.value.trim()) {
            alert("Informe o nome do equipamento.");
            nome.focus();
            return false;
        }

        const watts = Number(potencia.value);
        const horasDia = Number(horas.value);
        const horaInicio = Number(horario.value);

        if (
            potencia.value === "" ||
            !Number.isFinite(watts) ||
            watts <= 0 ||
            watts > 9999999
        ) {
            alert("Informe uma potência válida.");
            potencia.focus();
            return false;
        }

        if (
            horas.value === "" ||
            !Number.isFinite(horasDia) ||
            horasDia <= 0 ||
            horasDia > 24
        ) {
            alert("Informe entre 1 e 24 horas de utilização.");
            horas.focus();
            return false;
        }

        if (
            horario.value === "" ||
            !Number.isInteger(horaInicio) ||
            horaInicio < 0 ||
            horaInicio > 23
        ) {
            alert("Informe um horário entre 0 e 23.");
            horario.focus();
            return false;
        }

        return true;
    }

    // ==========================================
    // 5. CADASTRAR NO SUPABASE
    // ==========================================

    btnAdicionar.addEventListener("click", async () => {

        if (!validarFormulario()) return;

        if (!window.db) {
            alert("Erro: conexão com o Supabase não encontrada.");
            console.error("window.db não está definido.");
            return;
        }

        const equipamento = {

            nome: nome.value.trim(),

            potencia_w: Number(potencia.value),

            horas_por_dia: Number(horas.value),

            horario_inicio: Number(horario.value),

            icone: iconeSelecionado

        };

        try {

            btnAdicionar.disabled = true;
            btnAdicionar.textContent = "Salvando...";

            const { data, error } = await window.db
                .from("equipamentos")
                .insert([equipamento])
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log("Equipamento salvo:", data);

            alert("Equipamento cadastrado com sucesso!");

            // Avisar o Dashboard

            window.parent.postMessage(
                { tipo: "equipamento-cadastrado" },
                window.location.origin
            );

        } catch (error) {

            console.error("Erro no cadastro:", error);

            alert(
                "Não foi possível cadastrar o equipamento.\n" +
                "Verifique a conexão e as permissões do Supabase."
            );

        } finally {

            btnAdicionar.disabled = false;

            btnAdicionar.textContent = "+ Adicionar equipamento";

        }

    });

});
