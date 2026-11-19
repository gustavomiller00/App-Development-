
document.addEventListener("DOMContentLoaded", () => {

    // Elementos do toggle
    const btnLoginToggle = document.querySelector(".Login");
    const btnCadastroToggle = document.querySelector(".Cadastro");

    // Elementos da página
    const nome = document.getElementById("Nome");
    const linha = document.getElementById("Linha");
    const termos = document.getElementById("TermosdeUso");

    const textOu = document.getElementById("TextOu");
    const btnLogin = document.querySelector(".btnLogin");

    const titulo = document.getElementById("Titulo");
    const subtitulo = document.getElementById("Subtitulo");

    // Elementos exclusivos do Login
    const lembrar = document.querySelector(".check-box");
    const esqueciSenha = document.getElementById("EsqueciSenha");

    // Função para alternar entre Login e Cadastro
    function alternarPagina(tipo) {

        const cadastro = tipo === "cadastro";

        // Toggle ativo
        btnLoginToggle.classList.toggle("active", !cadastro);
        btnCadastroToggle.classList.toggle("active", cadastro);

        // Campos exclusivos do Cadastro
        nome.parentElement.style.display = cadastro ? "block" : "none";
        linha.style.display = cadastro ? "block" : "none";
        termos.style.display = cadastro ? "flex" : "none";

        // Elementos exclusivos do Login
        lembrar.style.display = cadastro ? "none" : "flex";
        esqueciSenha.style.display = cadastro ? "none" : "flex";

        // Texto do login social
        textOu.textContent = cadastro
            ? "ou, se cadastre com"
            : "ou, faça login com";

        // Botão principal
        btnLogin.textContent = cadastro
            ? "Criar minha conta"
            : "Entrar";

        // Título
        titulo.textContent = cadastro
            ? "Comece a economizar"
            : "Boas vindas de volta!";

        // Subtítulo
        subtitulo.textContent = cadastro
            ? "Crie sua conta e conheça melhor sua energia"
            : "Entre para acompanhar a energia da sua casa.";

    }

    // Eventos dos botões
    btnLoginToggle.addEventListener("click", (event) => {
        event.preventDefault();
        alternarPagina("login");
    });

    btnCadastroToggle.addEventListener("click", (event) => {
        event.preventDefault();
        alternarPagina("cadastro");
    });

    // Impede navegação do botão enquanto não houver autenticação
    btnLogin.addEventListener("click", (event) => {
        event.preventDefault();

        const cadastro = btnCadastroToggle.classList.contains("active");

        if (cadastro) {
            console.log("Ação: Criar conta");
        } else {
            console.log("Ação: Entrar");
        }
    });

    // Estado inicial
    alternarPagina("login");

});
